from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Self

from sonolus.script.archetype import (
    EntityRef,
    StandardImport,
    WatchArchetype,
    entity_data,
    imported,
    shared_memory,
)
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

    # floor and y at current time
    y_pos: float = shared_memory()
    floor_position: float = shared_memory()


class EaseEvent(WatchArchetype, ABC):
    beat: StandardImport.BEAT
    value: float = imported()
    ease_type: int = imported(name="easeType")  # won't exist on canvas speed
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

    # different implementation in canvas speed
    def interpolate_value(self, max_time: float) -> float:
        if self.is_last_point:
            return self.value
        else:
            return remap_ease(
                self.time,
                self.next.time,
                self.value,
                self.next.value,
                max_time,
                self.ease_type,
            )

    @abstractmethod
    def update_value(self, value: float) -> None:
        raise NotImplementedError

    def update_sequential(self):
        self.update_value(self.interpolate_value(max(time(), self.time)))


class CanvasEvent(EaseEvent, ABC):
    canvas_ref: EntityRef[Canvas] = imported(name="canvas")

    @property
    def canvas(self) -> Canvas:
        return self.canvas_ref.get()


class CanvasMove(CanvasEvent):
    name = "Canvas Move"

    def preprocess(self):
        super().preprocess()
        if Options.mirror:
            self.value = -self.value

    def update_value(self, value: float) -> None:
        self.canvas.y_pos = value


class CanvasSpeed(CanvasEvent):
    name = "Canvas Speed"

    floor_position: float = imported(name="floorPosition")

    def update_value(self, value: float) -> None:
        self.canvas.floor_position = value

    # we need to interpolate floor_position and not value
    def interpolate_value(self, max_time: float) -> float:
        return self.floor_position + self.value * (max_time - self.time)


class CameraMove(EaseEvent):
    name = "Camera Move"

    def preprocess(self):
        super().preprocess()
        if Options.mirror:
            self.value = -self.value

    def update_value(self, value: float) -> None:
        camera.y_pos = value


class CameraScale(EaseEvent):
    name = "Camera Scale"

    def update_value(self, value: float) -> None:
        camera.scale = value


EASE_EVENT_ARCHETYPES = [
    CanvasMove,
    CanvasSpeed,
    CameraMove,
    CameraScale,
]
