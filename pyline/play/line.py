from __future__ import annotations

from abc import ABC

from sonolus.script.archetype import (
    EntityRef,
    PlayArchetype,
    StandardImport,
    callback,
    entity_data,
    imported,
    shared_memory,
)
from sonolus.script.debug import notify
from sonolus.script.runtime import time
from sonolus.script.timing import beat_to_time
from sonolus.script.vec import Vec2

from pyline.lib.layout import (
    X_JUDGE,
    floor_to_x,
    get_visual_end_time,
    get_visual_start_time,
)
from pyline.lib.line import (
    draw_judge_ring,
    draw_line,
    get_y_at_judge_line,
)
from pyline.lib.options import Options
from pyline.play.ease_events import Canvas, camera


class Line(PlayArchetype):
    """Only used to store line properties, never spawn"""

    name = "Line"

    first_point_ref: EntityRef[LinePoint] = imported(name="firstPoint")
    last_point_ref: EntityRef[LinePoint] = imported(name="lastPoint")
    has_hold_notes: bool = imported(name="hasHoldNotes")

    visual_start_time: float = entity_data()

    judge_ring_ref: EntityRef[JudgeRingColor] = shared_memory()
    line_color_ref: EntityRef[LineColor] = shared_memory()

    # Hold Notes need to know the line y position at judge line, which is the intersection of
    # the line from (LinePoint after judge line) to (next LinePoint which is before judge line) and the judge line.
    # So because that LinePoint entity constantly changes, we need to store in shared memory
    pos_y_point_ref: EntityRef[LinePoint] = shared_memory()

    @property
    def y_at_judge_line(self) -> float:
        """Only used by hold notes"""
        return get_y_at_judge_line(self.pos_y_point_ref.get())

    @property
    def no_judge_ring(self) -> bool:
        return self.judge_ring_ref.index == 0

    @property
    def has_line_color(self) -> bool:
        return self.line_color_ref.index > 0

    @property
    def judge_ring(self) -> JudgeRingColor:
        return self.judge_ring_ref.get()

    @property
    def line_color(self) -> LineColor:
        return self.line_color_ref.get()

    @callback(order=2)  # need to run after LinePoint
    def preprocess(self):
        # WARN: no guarantee first point is first visual point beacuse time change
        self.pos_y_point_ref = self.first_point_ref
        self.visual_start_time = self.first_point_ref.get().visual_start_time


class ColorChange(ABC, PlayArchetype):
    beat: StandardImport.BEAT
    next_beat: float = imported(name="nextBeat")
    start_alpha: float = imported(name="startAlpha")
    end_alpha: float = imported(name="endAlpha")
    start_color: int = imported(name="startColorIndex")
    end_color: int = imported(name="endColorIndex")
    is_first_point: bool = imported(name="isFirstPoint")
    line_ref: EntityRef[Line] = imported(name="line")

    # color or alpha transition
    has_transition: bool = imported(name="hasTransition")

    time: float = entity_data()
    next_time: float = entity_data()
    spawn_time: float = entity_data()

    @property
    def line(self) -> Line:
        return self.line_ref.get()

    @property
    def is_last_point(self) -> bool:
        return self.next_beat == 0

    @callback(order=4)  # need to run after Line
    def preprocess(self):
        self.time = beat_to_time(self.beat)

        self.spawn_time = (
            self.line.visual_start_time if self.is_first_point else self.time
        )

        if self.next_beat:
            self.next_time = beat_to_time(self.next_beat)

    def spawn_order(self) -> float:
        return self.spawn_time

    def should_spawn(self) -> bool:
        return time() >= self.spawn_time


class JudgeRingColor(ColorChange):
    name = "Judge Ring Color"

    def update_sequential(self):
        self.line.judge_ring_ref = self.ref()
        self.despawn = True


class LineColor(ColorChange):
    name = "Line Color"

    def update_sequential(self):
        self.line.line_color_ref = self.ref()
        self.despawn = True


class LinePoint(PlayArchetype):
    name = "Line Point"

    beat: StandardImport.BEAT
    floor_position: float = imported(name="floorPosition")
    y_pos: float = imported(name="yPos")
    ease_type: int = imported(name="easeType")
    alpha: float = imported()
    color: int = imported(name="colorIndex")
    next_point_ref: EntityRef[LinePoint] = imported(name="nextPoint")
    canvas_ref: EntityRef[Canvas] = imported(name="canvas")
    line_ref: EntityRef[Line] = imported(name="line")

    target_time: float = entity_data()
    visual_start_time: float = entity_data()
    visual_end_time: float = entity_data()

    @property
    def is_last_point(self) -> bool:
        return not self.next_point_ref.index

    @property
    def next(self) -> LinePoint:
        return self.next_point_ref.get()

    @property
    def line(self) -> Line:
        return self.line_ref.get()

    @property
    def canvas(self) -> Canvas:
        return self.canvas_ref.get()

    @property
    def pos(self) -> Vec2:
        x = floor_to_x(self.floor_position, self.canvas.floor_position)
        y = 2 * (self.y_pos + self.canvas.y_pos - camera.y_pos)
        return Vec2(x, y)

    @callback(order=1)  # need to run after canvas speed preprocess
    def preprocess(self):
        self.target_time = beat_to_time(self.beat)

        if Options.mirror:
            self.y_pos = -self.y_pos

        if self.is_last_point:
            return

        if self.line.has_hold_notes and self.next.is_last_point:
            self.line.pos_y_point_ref = self.ref()

        if self.line.first_point_ref.index == self.index:
            self.visual_start_time = get_visual_start_time(
                self.floor_position,
                self.canvas.first_speed,
            )
            self.visual_end_time = get_visual_end_time(
                self.next.floor_position,
                self.next.canvas.last_speed,
            )

        # Line are drawn from a point to its next. However next point (including last point) might appear before this point.
        # So we need to take the first visual start time
        self.next.visual_start_time = get_visual_start_time(
            self.next.floor_position,
            self.next.canvas.first_speed,
        )

        self.next.visual_end_time = (
            -2  # don't matter in Play mode
            if self.next.is_last_point
            else get_visual_end_time(
                self.next.next.floor_position,
                self.next.next.canvas.last_speed,
            )
        )

        if self.visual_start_time <= -2:
            # most likely invalid, usually better if point doesn't not appear
            notify("Invalid start time")
            self.visual_end_time = -1e7
            return

        self.visual_start_time = min(
            self.visual_start_time, self.next.visual_start_time
        )

        self.visual_end_time = max(self.visual_end_time, self.next.visual_end_time)

    def spawn_order(self) -> float:
        # last point has nothing to draw and can't update line y pos so no need to spawn it
        return 1e8 if self.is_last_point else self.visual_start_time

    def should_spawn(self) -> bool:
        return (not self.is_last_point) and time() >= self.visual_start_time

    def update_parallel(self):
        # Skin.note_drag.draw(Rect.from_margin(0.03).translate(self.pos), 1000, 0.2)
        # Skin.lines[0].draw(points_to_quad(self.pos, self.next.pos), 1, 0.1)
        if time() >= self.visual_end_time:
            self.despawn = True
            return

        draw_line(self)

        if self.pos.x >= X_JUDGE and self.next.pos.x <= X_JUDGE:
            draw_judge_ring(self)

    def update_sequential(self):
        if self.line.has_hold_notes and self.next.pos.x <= X_JUDGE <= self.pos.x:
            self.line.pos_y_point_ref = self.ref()
