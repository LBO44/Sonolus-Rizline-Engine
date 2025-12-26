from __future__ import annotations

from sonolus.script.archetype import (
    EntityRef,
    StandardImport,
    WatchArchetype,
    callback,
    entity_data,
    entity_memory,
    imported,
)
from sonolus.script.bucket import Judgment
from sonolus.script.runtime import is_replay, is_skip, time
from sonolus.script.timing import beat_to_time
from sonolus.script.vec import Vec2

from pyline.lib.buckets import Buckets
from pyline.lib.layout import X_JUDGE, X_NOTE_DISAPPEAR, floor_to_x, is_in_challenge
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
    get_note_pos,
    play_bad_particle,
    play_note_particle,
    schedule_note_sfx,
)
from pyline.lib.options import Options
from pyline.watch.ease_events import Canvas
from pyline.watch.line import Line, LinePoint


class Note(WatchArchetype):
    is_scored = True

    beat: StandardImport.BEAT
    kind: NoteKind = imported()
    previous_line_point_ref: EntityRef[LinePoint] = imported(name="previousLinePoint")

    end_time: float = imported(name="endTime")
    end_y: float = imported(name="endY")
    jugement: StandardImport.JUDGMENT
    accuracy: StandardImport.ACCURACY

    target_time: float = entity_data()
    visual_start_time: float = entity_data()

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
        self.result.bucket = get_note_bucket(self.kind)

        self.target_time = beat_to_time(self.beat)
        self.result.target_time = self.target_time
        self.result.bucket_value = 0

        # note might spawn a bit too soon, but sligthly faster level loading
        self.visual_start_time = self.point.visual_start_time

        if is_replay() and self.end_time != 0:
            if self.jugement == Judgment.MISS:
                NoteMissEffect.spawn(start_time=self.end_time, pos_y=self.end_y)
            if self.jugement != Judgment.MISS or Options.auto_sfx:
                schedule_note_sfx(
                    self.kind, self.target_time if Options.auto_sfx else self.end_time
                )
            self.result.bucket_value = self.accuracy * 1000

        else:
            self.jugement = Judgment.PERFECT
            schedule_note_sfx(self.kind, self.target_time)

    def terminate(self):
        if is_skip() or time() < 0:
            return
        if self.jugement != Judgment.MISS:
            play_note_particle(self.pos)

    def spawn_time(self) -> float:
        return self.visual_start_time

    def despawn_time(self) -> float:
        if is_replay() and self.end_time:
            return self.end_time
        else:
            return self.target_time

    def update_parallel(self):
        draw_note(self)


class NoteHoldTail(WatchArchetype):
    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    head_ref: EntityRef[Note] = imported(name="holdStart")
    canvas_ref: EntityRef[Canvas] = imported(name="canvas")

    tail_target_time: float = entity_data()

    end_time: float = imported(name="endTime")
    end_y: float = imported(name="endY")
    end_tail_x: float = imported(name="endTailX")
    jugement: StandardImport.JUDGMENT
    accuracy: StandardImport.ACCURACY

    @property
    def head(self) -> Note:
        return self.head_ref.get()

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
        self.result.bucket = Buckets.hold_end

        self.tail_target_time = beat_to_time(self.beat)
        self.result.target_time = self.tail_target_time

        if is_replay():
            self.result.bucket_value = self.accuracy * 1000
            if self.jugement == Judgment.MISS and self.end_time != 0:
                NoteHoldMissEffect.spawn(
                    start_time=self.end_time,
                    pos_y=self.end_y,
                    start_tail_x=self.end_tail_x,
                )
                if self.head.jugement != Judgment.MISS:
                    NoteMissEffect.spawn(start_time=self.end_time, pos_y=self.end_y)
        else:
            self.jugement = Judgment.PERFECT

        if self.jugement != Judgment.MISS:
            NoteHoldDespawnEffect.spawn(
                start_time=self.tail_target_time, line_ref=self.head.point.line_ref
            )

    def spawn_time(self) -> float:
        return self.head.visual_start_time

    def despawn_time(self) -> float:
        if is_replay() and self.end_time:
            return self.end_time
        else:
            return self.tail_target_time

    def terminate(self):
        if is_skip():
            return
        if self.jugement != Judgment.MISS:
            start_pos = Vec2(self.head_x, self.pos_y)
            play_note_particle(start_pos)

    def update_parallel(self):
        draw_hold_note(self.pos_y, self.head_x, self.tail_x, self.index)


class NoteHoldDespawnEffect(WatchArchetype):
    name = "Note Hold Despawn Effect"

    line_ref: EntityRef[Line] = entity_memory()
    start_time: float = entity_memory()

    def spawn_time(self) -> float:
        return self.start_time

    def despawn_time(self) -> float:
        return self.start_time + NOTE_HOLD_DESPAWN_DURATION

    def update_parallel(self):
        draw_hold_note_despawn(
            self.start_time,
            self.line_ref.get().y_at_judge_line,
        )


class NoteHoldMissEffect(WatchArchetype):
    name = "Note Hold Miss Effect"

    start_time: float = entity_memory()
    pos_y: float = entity_memory()
    start_tail_x: float = entity_memory()

    def spawn_time(self) -> float:
        return self.start_time

    def despawn_time(self) -> float:
        return (
            self.start_time
            + (X_NOTE_DISAPPEAR - self.start_tail_x) / NOTE_HOLD_MISS_SPEED
        )

    def update_parallel(self):
        draw_hold_note_miss_effect(self.start_time, self.pos_y, self.start_tail_x)


class NoteMissEffect(WatchArchetype):
    name = "Note Miss Effect"

    start_time: float = entity_memory()
    pos_y: float = entity_memory()

    def spawn_time(self) -> float:
        return self.start_time

    def despawn_time(self) -> float:
        return self.start_time + NOTE_MISS_EFFECT_DURATION

    def update_parallel(self):
        draw_miss_effect(self.start_time, self.pos_y)


class NoteBadParticleSchedule(WatchArchetype):
    name = "Bad Particle"

    start_time: float = entity_memory()
    pos: Vec2 = entity_memory()

    def spawn_time(self) -> float:
        return self.start_time

    def despawn_time(self) -> float:
        return self.start_time + 0.1

    def initialize(self):
        if not is_skip():
            play_bad_particle(self.pos)


NOTES_ARCHETYPES = (
    Note.derive("Note Normal", True, key=NoteType.NORMAL),
    Note.derive("Note Challenge", True, key=NoteType.CHALLENGE),
    NoteHoldTail.derive("Note Hold Tail Normal", True, key=NoteType.NORMAL),
    NoteHoldTail.derive("Note Hold Tail Challenge", True, key=NoteType.CHALLENGE),
    NoteHoldDespawnEffect,
    NoteHoldMissEffect,
    NoteMissEffect,
    NoteBadParticleSchedule,
)
