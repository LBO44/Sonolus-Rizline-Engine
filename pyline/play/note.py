from __future__ import annotations

from sonolus.script.archetype import (
    EntityRef,
    PlayArchetype,
    StandardImport,
    callback,
    entity_data,
    entity_memory,
    exported,
    imported,
    shared_memory,
)
from sonolus.script.bucket import Judgment, JudgmentWindow
from sonolus.script.interval import Interval, clamp
from sonolus.script.runtime import (
    Touch,
    delta_time,
    input_offset,
    offset_adjusted_time,
    time,
    touches,
)
from sonolus.script.timing import beat_to_time
from sonolus.script.vec import Vec2

from pyline.lib.buckets import HOLD_END_WINDOW, Buckets
from pyline.lib.layout import (
    X_JUDGE,
    X_NOTE_DISAPPEAR,
    X_SPAWN,
    floor_to_x,
    is_in_challenge,
)
from pyline.lib.note import (
    NOTE_HOLD_DESPAWN_DURATION,
    NOTE_HOLD_MISS_SPEED,
    NOTE_MISS_EFFECT_DURATION,
    NoteKind,
    NoteType,
    draw_hold_note,
    draw_hold_note_despawn,
    draw_hold_note_miss_effect,
    draw_miss_effect,
    draw_note,
    get_note_bucket,
    get_note_judgement_window,
    get_note_pos,
    play_bad_particle,
    play_note_particle,
    play_note_sfx,
    schedule_note_sfx,
)
from pyline.lib.options import Options
from pyline.lib.streams import Streams
from pyline.play.ease_events import Canvas
from pyline.play.input import claim_touch, unclaimed_taps
from pyline.play.line import Line, LinePoint


class Note(PlayArchetype):
    is_scored = True

    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    kind: NoteKind = imported()
    previous_line_point_ref: EntityRef[LinePoint] = imported(name="previousLinePoint")

    partner_note: EntityRef[Note] = imported(name="partnerNote")
    """
    This is a ref to the other note on the same beat (if there is one)
    If there are 2 notes with the same beat (tap or hold start, don't matter),
    touch position will be used to determine which touch is for wich note.
    (In Rizline there will never be more than 2 tappable notes at the same beat
    """

    target_time: float = entity_data()
    start_time: float = entity_data()

    judgment_window: JudgmentWindow = entity_data()
    input_interval: Interval = entity_data()
    # for early drag notes
    best_touch_time: float = entity_memory()

    was_hit: bool = shared_memory()
    """
    used by hold start and double (same beat) notes
    can't use entity state (despwan) for double notes because it only gets updated next frame
    """
    skipped_touch_for_partner: bool = entity_memory()
    """ If there are multiple touch, we only want to skip one. """
    bad_time: float = entity_memory()

    end_time: float = exported(name="endTime")
    end_y: float = exported(name="endY")  # used for miss effect

    @property
    def point(self) -> LinePoint:
        return self.previous_line_point_ref.get()

    @property
    def pos(self) -> Vec2:
        return get_note_pos(self)

    @property
    def is_in_challenge(self) -> bool:
        return is_in_challenge(self.pos)

    @callback(order=2)  # need to run after LinePoint
    def preprocess(self):
        self.judgment_window = get_note_judgement_window(self.kind)
        self.target_time = beat_to_time(self.beat)
        self.input_interval = (
            self.judgment_window.good + self.target_time + input_offset()
        )
        self.result.bucket = get_note_bucket(self.kind)
        self.result.accuracy = 1.0

        self.start_time = min(self.point.visual_start_time, self.input_interval.start)
        if Options.auto_sfx:
            schedule_note_sfx(self.kind, self.target_time)

    def spawn_order(self) -> float:
        return self.start_time

    def should_spawn(self) -> bool:
        return time() >= self.start_time

    def update_parallel(self):
        if (
            self.kind == NoteKind.DRAG
            and offset_adjusted_time() > self.target_time
            and self.best_touch_time
        ):
            if (offset_adjusted_time() - self.target_time) > (
                self.best_touch_time - self.target_time
            ):
                self.judge(self.best_touch_time)

        if time() > self.input_interval.end:
            if self.bad_time:
                self.judge(self.bad_time)
            else:
                self.despawn = True
                NoteMissEffect.spawn(
                    start_time=self.input_interval.end, pos_y=self.pos.y
                )
            return
        draw_note(self)

    def touch(self):
        if self.despawn:
            return
        if time() not in self.input_interval:
            return
        match self.kind:
            case NoteKind.TAP | NoteKind.HOLD_START:
                self.handle_tap_input()
            case NoteKind.DRAG:
                self.handle_drag_input()

    def handle_tap_input(self):
        for touch in unclaimed_taps():
            if touch.start_time not in (self.judgment_window.good + self.target_time):
                continue

            if self.should_skip_touch_for_partner(touch):
                continue

            claim_touch(touch.id)

            is_bad_tap = touch.start_time < (
                self.target_time + self.judgment_window.great.start
            )

            if is_bad_tap:
                self.bad_time = max(touch.start_time, self.bad_time)
                play_bad_particle(touch.position)
                Streams.bad_effects[time()] = touch.position
            else:
                self.judge(touch.start_time)
                self.was_hit = True
                break

    def should_skip_touch_for_partner(self, touch: Touch) -> bool:
        if self.partner_note.index == -1 or self.skipped_touch_for_partner:
            return False

        partner_note = self.partner_note.get()
        if partner_note.was_hit:
            return False

        partner_y = partner_note.pos.y
        middle_y = (self.pos.y + partner_y) / 2

        if (self.pos.y < partner_y and touch.start_position.y > middle_y) or (
            self.pos.y > partner_y and touch.start_position.y < middle_y
        ):
            self.skipped_touch_for_partner = True
            return True

        return False

    def handle_drag_input(self):
        for _ in touches():
            if offset_adjusted_time() >= self.target_time:
                if (
                    offset_adjusted_time() - delta_time()
                    <= self.target_time
                    <= offset_adjusted_time()
                ):
                    # get perfect accuracy if touch is on the target time frame
                    self.judge(self.target_time)
                else:
                    # can't get a better time
                    self.judge(offset_adjusted_time())
        else:
            self.best_touch_time = offset_adjusted_time()

    def judge(self, judgment_time: float):
        judgment = self.judgment_window.judge(
            actual=judgment_time, target=self.target_time
        )
        self.result.judgment = judgment
        self.result.accuracy = clamp(judgment_time - self.target_time, -1.0, 1.0)
        self.result.bucket_value = self.result.accuracy * 1000

        if judgment in (Judgment.PERFECT, Judgment.GREAT, Judgment.GOOD):
            play_note_sfx(self.kind)
            if judgment != Judgment.GOOD:
                play_note_particle(self.pos)

        self.despawn = True

    def terminate(self):
        self.end_time = time()
        self.end_y = self.pos.y


class NoteHoldTail(PlayArchetype):
    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    head_ref: EntityRef[Note] = imported(name="holdStart")
    canvas_ref: EntityRef[Canvas] = imported(name="canvas")

    tail_target_time: float = entity_data()
    start_time: float = entity_data()

    was_judged: bool = entity_memory()
    """Hold Note should still be drawn even if it was released slightly early"""
    judgment_window: JudgmentWindow = entity_data()
    input_interval: Interval = entity_data()

    end_time: float = exported(name="endTime")

    end_y: float = exported(name="endY")
    end_tail_x: float = exported(name="endTailX")  # used for miss effect

    @property
    def head(self) -> Note:
        return self.head_ref.get(check=False)

    @property
    def pos_y(self) -> float:
        return (
            self.head.pos.y
            if self.head.target_time > time()
            else self.head.point.line.y_at_judge_line
        )

    @property
    def tail_x(self) -> float:
        return min(
            self.head_x,
            floor_to_x(self.floor_position, self.canvas_ref.get().floor_position),
        )

    @property
    def head_x(self) -> float:
        return self.head.pos.x if self.head.target_time > time() else X_JUDGE

    def preprocess(self):
        self.judgment_window = HOLD_END_WINDOW
        self.tail_target_time = beat_to_time(self.beat)
        self.input_interval = (
            self.judgment_window.good + self.tail_target_time + input_offset()
        )
        self.result.bucket = Buckets.hold_end
        self.result.accuracy = 1.0
        self.start_time = min(self.head.start_time, self.input_interval.start)

    def spawn_order(self) -> float:
        return self.start_time

    def should_spawn(self) -> bool:
        return time() >= self.start_time

    @callback(order=1)
    def touch(self):
        if (not self.head.was_hit) or self.despawn or self.was_judged:
            return

        last_release_time = 0
        has_active_touch = False

        for touch in touches():
            if touch.start_time in self.head.input_interval:
                if touch.ended:
                    last_release_time = max(last_release_time, offset_adjusted_time())
                else:
                    has_active_touch = True
                    break

        if not has_active_touch:
            if time() < self.input_interval.start:
                self.despawn = True
                NoteMissEffect.spawn(start_time=time(), pos_y=self.pos_y)
                NoteHoldMissEffect.spawn(
                    start_time=time(),
                    pos_y=self.pos_y,
                    start_tail_x=max(self.tail_x, X_SPAWN),
                )
            else:
                self.set_result(last_release_time)

    def set_result(self, judgment_time: float):
        self.was_judged = True
        judgment = self.judgment_window.judge(
            actual=judgment_time, target=self.tail_target_time
        )
        self.result.judgment = judgment
        self.result.accuracy = clamp(judgment_time - self.tail_target_time, -1.0, 1.0)
        self.result.bucket_value = self.result.accuracy * 1000

    def update_parallel(self):
        if time() > self.head.input_interval.end and not self.head.was_hit:
            NoteHoldMissEffect.spawn(
                start_time=time(),
                pos_y=self.pos_y,
                start_tail_x=max(self.tail_x, X_SPAWN),
            )
            self.despawn = True
            return

        if time() >= self.tail_target_time:
            if not self.was_judged:
                self.set_result(self.tail_target_time)
            play_note_particle(Vec2(X_JUDGE, self.pos_y))
            NoteHoldDespawnEffect.spawn(
                start_time=self.tail_target_time, line_ref=self.head.point.line_ref
            )
            self.despawn = True
            return

        draw_hold_note(self.pos_y, self.head_x, self.tail_x, self.index)

    def terminate(self):
        self.end_time = time()
        self.end_y = self.pos_y
        self.end_tail_x = max(self.tail_x, X_SPAWN)


class NoteHoldDespawnEffect(PlayArchetype):
    name = "Note Hold Despawn Effect"

    line_ref: EntityRef[Line] = entity_memory()
    start_time: float = entity_memory()

    def update_parallel(self):
        if time() >= self.start_time + NOTE_HOLD_DESPAWN_DURATION:
            self.despawn = True
            return
        draw_hold_note_despawn(
            self.start_time,
            self.line_ref.get().y_at_judge_line,
        )


class NoteHoldMissEffect(PlayArchetype):
    name = "Note Hold Miss Effect"

    start_time: float = entity_memory()
    pos_y: float = entity_memory()
    start_tail_x: float = entity_memory()

    def update_parallel(self):
        if (
            time()
            >= self.start_time
            + (X_NOTE_DISAPPEAR - self.start_tail_x) / NOTE_HOLD_MISS_SPEED
        ):
            self.despawn = True
            return
        draw_hold_note_miss_effect(self.start_time, self.pos_y, self.start_tail_x)


class NoteMissEffect(PlayArchetype):
    name = "Note Miss Effect"

    start_time: float = entity_memory()
    pos_y: float = entity_memory()

    def update_parallel(self):
        if time() >= self.start_time + NOTE_MISS_EFFECT_DURATION:
            self.despawn = True
            return

        draw_miss_effect(self.start_time, self.pos_y)


NOTES_ARCHETYPES = (
    Note.derive("Note Normal", True, key=NoteType.NORMAL),
    Note.derive("Note Challenge", True, key=NoteType.CHALLENGE),
    NoteHoldTail.derive("Note Hold Tail Normal", True, key=NoteType.NORMAL),
    NoteHoldTail.derive("Note Hold Tail Challenge", True, key=NoteType.CHALLENGE),
    NoteHoldDespawnEffect,
    NoteHoldMissEffect,
    NoteMissEffect,
)
