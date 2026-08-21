from __future__ import annotations

from sonolus.script.archetype import (
    EntityRef,
    HapticType,
    PlayArchetype,
    StandardImport,
    callback,
    entity_data,
    entity_memory,
    exported,
    imported,
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

from pyline.lib.buckets import NoteKind
from pyline.lib.layout import (
    X_JUDGE,
    X_NOTE_DISAPPEAR,
    X_SPAWN,
    floor_to_x,
)
from pyline.lib.note import (
    NOTE_HOLD_DESPAWN_DURATION,
    NOTE_HOLD_MISS_SPEED,
    NOTE_MISS_EFFECT_DURATION,
    ChartStats,
    draw_hold_note,
    draw_hold_note_despawn,
    draw_hold_note_miss_effect,
    draw_miss_effect,
    draw_note,
    get_note_bucket,
    get_note_judgement_window,
    get_note_pos,
    init_challenge_note_entity_life,
    play_bad_particle,
    play_note_particle,
    play_note_sfx,
    schedule_note_sfx,
)
from pyline.lib.options import Options
from pyline.lib.streams import Streams
from pyline.play.ease_events import Canvas
from pyline.play.input import (
    claim_touch,
    claimed_taps,
    get_touch_owner_index,
    is_touch_claimed,
    unclaimed_taps,
)
from pyline.play.line import Line, LinePoint


class Note(PlayArchetype):
    name = "Note"
    is_scored = True

    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    kind: NoteKind = imported()
    previous_line_point_ref: EntityRef[LinePoint] = imported(name="previousLinePoint")
    is_challenge: bool = imported(name="isChallenge")

    target_time: float = entity_data()
    start_time: float = entity_data()

    judgment_window: JudgmentWindow = entity_data()
    input_interval: Interval = entity_data()

    claimed_touch_id: int = entity_memory()
    claimed_touch_time: float = entity_memory()
    best_touch_time: float = entity_memory()
    """for early drag notes"""

    bad_time: float = entity_memory()
    bad_pos: Vec2 = entity_memory()

    end_time: float = exported(name="endTime")
    end_y: float = exported(name="endY")  # used for miss effect

    @property
    def point(self) -> LinePoint:
        return self.previous_line_point_ref.get()

    @property
    def pos(self) -> Vec2:
        return get_note_pos(self)

    @property
    def pos_end_y(self) -> float:
        # If missed it means we passed Judge Line
        # I don't know whether this should also apply to tap/drag
        return (
            self.point.line.y_at_judge_line
            if self.kind == NoteKind.HOLD_START
            else get_note_pos(self).y
        )

    @callback(order=2)  # need to run after LinePoint
    def preprocess(self):
        self.judgment_window = get_note_judgement_window(self.kind, self.is_challenge)
        self.target_time = beat_to_time(self.beat)
        self.input_interval = (
            self.judgment_window.good + self.target_time + input_offset()
        )

        if self.is_challenge:
            init_challenge_note_entity_life(self)
            self.entity_score_multiplier = ChartStats.challenge_score_multiplier

        self.claimed_touch_id = -1

        self.start_time = min(self.point.visual_start_time, self.input_interval.start)
        if Options.auto_sfx:
            schedule_note_sfx(self.kind, self.target_time)

    def spawn_order(self) -> float:
        return self.start_time

    def should_spawn(self) -> bool:
        return time() >= self.start_time

    def update_parallel(self):
        self.validate_touch()
        if self.despawn:
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

    def check_bad_tap(self, tap: Touch):
        is_bad_tap = tap.start_time < (
            self.target_time + self.judgment_window.great.start
        )

        if is_bad_tap:
            if self.bad_time < tap.start_time:
                self.bad_time = tap.start_time
                self.bad_pos = tap.position

    def handle_tap_input(self):
        """loop in unclaimed taps first, if there are none left, loop in all (claimed) taps"""

        for tap in unclaimed_taps():
            if tap.start_time not in self.input_interval:
                continue

            claim_touch(tap.id, self.index)
            self.claimed_touch_id = tap.id
            self.claimed_touch_time = tap.start_time

            self.check_bad_tap(tap)

            return

        # means all valid taps were already claimed,
        # we should go steal a claimed ones if we are before the note using it

        # Sorting the array each time since it might have been modfied by other notes
        sorted_tap = claimed_taps()
        sorted_tap.sort(
            key=lambda tap: self.at(get_touch_owner_index(tap.id)).target_time,
            reverse=True,
        )

        for tap in sorted_tap:
            if tap.start_time not in self.input_interval:
                continue

            tap_owner = self.at(get_touch_owner_index(tap.id))

            """
            If there are 2 notes with the same beat (tap or hold start, don't matter),
            touch position will be used to determine which touch is for which note.
            (In official Rizline chart there will never be more than 2 tappable notes on the same beat)
            """
            if (
                self.target_time == tap_owner.target_time
                and (
                    (
                        self.pos.y > tap_owner.pos.y
                        and tap.start_position.y > (self.pos.y + tap_owner.pos.y) / 2
                    )
                    or (
                        self.pos.y < tap_owner.pos.y
                        and tap.start_position.y < (self.pos.y + tap_owner.pos.y) / 2
                    )
                )
            ) or self.target_time < tap_owner.target_time:
                claim_touch(tap.id, self.index)
                self.claimed_touch_id = tap.id
                self.claimed_touch_time = tap.start_time
                self.check_bad_tap(tap)
                return

    def handle_drag_input(self):
        if len(touches()) > 0:
            self.update_best_judgment_time_with_current_time()
            if (
                offset_adjusted_time() - delta_time()
                <= self.target_time
                <= offset_adjusted_time()
            ):
                # get perfect accuracy if touch is on the target time frame
                self.best_touch_time = self.target_time

    def update_best_judgment_time_with_current_time(self):
        prev_error = abs(self.best_touch_time - self.target_time)
        new_error = abs(offset_adjusted_time() - self.target_time)
        if new_error < prev_error:
            self.best_touch_time = offset_adjusted_time()

    def validate_touch(self):
        # Make Sure Drag Notes get the best judgemnt possible
        if self.kind == NoteKind.DRAG and self.best_touch_time:
            can_improve_drag = (
                self.best_touch_time < self.target_time
                and offset_adjusted_time() - self.target_time
                < self.target_time - self.best_touch_time
            )
            if not can_improve_drag:
                self.judge(self.best_touch_time)
                return

        # Hanlde missed notes
        if time() > self.input_interval.end:
            if self.bad_time:
                self.judge(self.bad_time)
            else:
                self.result.judgment = Judgment.MISS
                self.despawn = True
                NoteMissEffect.spawn(
                    start_time=self.input_interval.end, pos_y=self.pos_end_y
                )
            return

        if self.claimed_touch_id == -1:
            return

        # Make sure our touch wasn't stolen
        if is_touch_claimed(
            self.claimed_touch_id
        ) and self.index == get_touch_owner_index(self.claimed_touch_id):
            if self.bad_time == self.claimed_touch_time:
                play_bad_particle(self.bad_pos)
                Streams.bad_effects[time()] = self.bad_pos
            else:
                self.judge(self.claimed_touch_time)
        else:
            self.bad_time = 0

        self.claimed_touch_id = -1

    def judge(self, judgment_time: float):
        judgment = self.judgment_window.judge(
            actual=judgment_time, target=self.target_time
        )
        self.result.judgment = judgment
        self.result.bucket = get_note_bucket(self.kind, self.is_challenge)
        self.result.accuracy = clamp(judgment_time - self.target_time, -1.0, 1.0)
        self.result.bucket_value = self.result.accuracy * 1000

        if judgment in (Judgment.PERFECT, Judgment.GREAT, Judgment.GOOD):
            play_note_sfx(self.kind)
            if judgment != Judgment.GOOD:
                play_note_particle(self.pos)

        if Options.haptic:
            match self.kind:
                case NoteKind.DRAG:
                    self.result.haptic = HapticType.LIGHT
                case NoteKind.TAP | NoteKind.HOLD_START:
                    self.result.haptic = HapticType.MEDIUM

        self.despawn = True

    def terminate(self):
        self.end_time = time()
        self.end_y = self.pos_end_y


class NoteHoldTail(PlayArchetype):
    name = "Note Hold Tail"
    is_scored = True

    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    head_ref: EntityRef[Note] = imported(name="holdStart")
    canvas_ref: EntityRef[Canvas] = imported(name="canvas")
    is_challenge: bool = imported(name="isChallenge")

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
        self.judgment_window = get_note_judgement_window(
            NoteKind.HOLD_END, self.is_challenge
        )
        self.tail_target_time = beat_to_time(self.beat)
        self.input_interval = (
            self.judgment_window.good + self.tail_target_time + input_offset()
        )

        if self.is_challenge:
            init_challenge_note_entity_life(self)
            self.entity_score_multiplier = ChartStats.challenge_score_multiplier

        self.start_time = min(self.head.start_time, self.input_interval.start)

    def spawn_order(self) -> float:
        return self.start_time

    def should_spawn(self) -> bool:
        return time() >= self.start_time

    @callback(order=1)
    def touch(self):
        if (not self.head.is_despawned) or self.despawn or self.was_judged:
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
        self.result.bucket = get_note_bucket(NoteKind.HOLD_END, self.is_challenge)
        self.result.accuracy = clamp(judgment_time - self.tail_target_time, -1.0, 1.0)
        self.result.bucket_value = self.result.accuracy * 1000

    def update_parallel(self):
        if time() > self.head.input_interval.end and not self.head.is_despawned:
            NoteHoldMissEffect.spawn(
                start_time=time(),
                pos_y=self.pos_y,
                start_tail_x=max(self.tail_x, X_SPAWN),
            )
            self.despawn = True
            self.result.judgment = Judgment.MISS
            return

        if time() >= self.tail_target_time:
            if not self.was_judged:
                self.set_result(self.tail_target_time)
            play_note_particle(Vec2(X_JUDGE, self.pos_y))
            if Options.haptic:
                self.result.haptic = HapticType.LIGHT
            if self.head.is_despawned:
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
        if (
            Options.particle != 0
            or time() >= self.start_time + NOTE_MISS_EFFECT_DURATION
        ):
            self.despawn = True
            return

        draw_miss_effect(self.start_time, self.pos_y)


NOTES_ARCHETYPES = (
    Note,
    NoteHoldTail,
    NoteHoldDespawnEffect,
    NoteHoldMissEffect,
    NoteMissEffect,
)
