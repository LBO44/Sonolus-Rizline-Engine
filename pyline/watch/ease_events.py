from __future__ import annotations

from abc import ABC
from typing import Any, Self

from sonolus.script.archetype import (
    EntityRef,
    StandardImport,
    WatchArchetype,
    entity_data,
    imported,
    shared_memory,
)
from sonolus.script.interval import remap
from sonolus.script.runtime import time
from sonolus.script.timing import beat_to_time

from pyline.lib.ease import camera, remap_ease
from pyline.lib.options import Options


class Canvas(WatchArchetype):
    """Only used to store info of a canvas"""

    name = "Canvas"

    first_speed_ref: EntityRef[CanvasSpeed] = imported(name="firstSpeed")

    @property
    def first_speed(self) -> CanvasSpeed:
        return self.first_speed_ref.get(check=False)

    y_pos: float = shared_memory()
    floor_position: float = shared_memory()


class EaseEvent(ABC, WatchArchetype):
    beat: StandardImport.BEAT
    value: float = imported()
    is_first_point: bool = imported(name="isFirstPoint")
    next_point_ref: EntityRef[Any] = imported(name="nextPoint")

    time: float = entity_data()

    @property
    def next(self) -> Self:
        return self.next_point_ref.with_archetype(type(self)).get(check=False)

    @property
    def is_last_point(self) -> bool:
        return not self.next_point_ref.index

    def preprocess(self):
        self.time = beat_to_time(self.beat)

    def spawn_time(self) -> float:
        return -1e8 if self.is_first_point else self.time

    def despawn_time(self) -> float:
        return 1e8 if self.is_last_point else self.next.time


class CanvasMove(EaseEvent):
    name = "Canvas Move"

    canvas_ref: EntityRef[Canvas] = imported(name="canvas")
    ease_type: int = imported(name="easeType")

    @property
    def canvas(self) -> Canvas:
        return self.canvas_ref.get()

    def preprocess(self):
        super().preprocess()
        if Options.mirror:
            self.value = -self.value

    def update_sequential(self):
        if self.is_last_point:
            self.update_value(self.value)
        else:
            self.update_value(
                remap_ease(
                    self.time,
                    self.next.time,
                    self.value,
                    self.next.value,
                    max(time(), self.time),
                    self.ease_type,
                )
            )

    def update_value(self, value: float) -> None:
        self.canvas.y_pos = value


class CanvasSpeed(EaseEvent):
    name = "Canvas Speed"

    canvas_ref: EntityRef[Canvas] = imported(name="canvas")
    floor_position: float = imported(name="floorPosition")

    @property
    def canvas(self) -> Canvas:
        return self.canvas_ref.get()

    def update_value(self, value: float) -> None:
        self.canvas.floor_position = value

    # we need to interpolate floor_position and not value
    def update_sequential(self):
        if self.is_last_point:
            self.update_value(self.floor_position + self.value * (time() - self.time))
        else:
            self.update_value(
                remap(
                    self.time,
                    self.next.time,
                    self.floor_position,
                    self.next.floor_position,
                    max(time(), self.time),
                )
            )


class CameraMove(EaseEvent):
    name = "Camera Move"

    ease_type: int = imported(name="easeType")

    def preprocess(self):
        super().preprocess()
        if Options.mirror:
            self.value = -self.value

    def update_sequential(self):
        if self.is_last_point:
            self.update_value(self.value)
        else:
            self.update_value(
                remap_ease(
                    self.time,
                    self.next.time,
                    self.value,
                    self.next.value,
                    max(time(), self.time),
                    self.ease_type,
                )
            )

    def update_value(self, value: float) -> None:
        camera.y_pos = value


class CameraScale(EaseEvent):
    name = "Camera Scale"

    ease_type: int = imported(name="easeType")

    def update_sequential(self):
        if self.is_last_point:
            self.update_value(self.value)
        else:
            self.update_value(
                remap_ease(
                    self.time,
                    self.next.time,
                    self.value,
                    self.next.value,
                    max(time(), self.time),
                    self.ease_type,
                )
            )

    def update_value(self, value: float) -> None:
        camera.scale = value


EASE_EVENT_ARCHETYPES = [
    CanvasMove,
    CanvasSpeed,
    CameraMove,
    CameraScale,
]
