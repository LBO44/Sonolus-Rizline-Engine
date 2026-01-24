from __future__ import annotations

from enum import IntEnum
from typing import Protocol

from sonolus.script.easing import (
    ease_in_circ,
    ease_in_cubic,
    ease_in_out_cubic,
    ease_in_out_quad,
    ease_in_out_quart,
    ease_in_out_quint,
    ease_in_quad,
    ease_in_quart,
    ease_in_quint,
    ease_in_sine,
    ease_out_circ,
    ease_out_cubic,
    ease_out_quad,
    ease_out_quart,
    ease_out_quint,
    ease_out_sine,
)
from sonolus.script.globals import level_memory
from sonolus.script.interval import lerp, remap


@level_memory
class camera:
    y_pos: float
    scale: float


class Canvas(Protocol):
    @property
    def first_speed(self) -> CanvasSpeed: ...
    @property
    def index(self) -> int: ...

    floor_position: float


class CanvasSpeed(Protocol):
    value: float
    floor_position: float
    time: float
    is_first_point: bool

    @property
    def index(self) -> int: ...
    @property
    def next(self) -> CanvasSpeed: ...
    @property
    def previous(self) -> CanvasSpeed: ...
    @property
    def is_last_point(self) -> bool: ...

    def at(self, index: int, check=True) -> CanvasSpeed: ...


class RizEaseType(IntEnum):
    Linear = 0
    InQuad = 1
    OutQuad = 2
    InOutQuad = 3
    InCubic = 4
    OutCubic = 5
    InOutCubic = 6
    InQuart = 7
    OutQuart = 8
    InOutQuart = 9
    InQuint = 10
    OutQuint = 11
    InOutQuint = 12
    Zero = 13
    One = 14
    InCirc = 15
    OutCirc = 16
    OutSine = 17
    InSine = 18


def remap_ease(
    a: float, b: float, c: float, d: float, x: float, ease_type: int
) -> float:
    t = remap(a, b, 0, 1, x)
    e = ease(t, ease_type)
    return lerp(c, d, e)


def ease(t: float, ease_type: int) -> float:
    match ease_type:
        case RizEaseType.Linear:
            return t
        case RizEaseType.InQuad:
            return ease_in_quad(t)
        case RizEaseType.OutQuad:
            return ease_out_quad(t)
        case RizEaseType.InOutQuad:
            return ease_in_out_quad(t)
        case RizEaseType.InCubic:
            return ease_in_cubic(t)
        case RizEaseType.OutCubic:
            return ease_out_cubic(t)
        case RizEaseType.InOutCubic:
            return ease_in_out_cubic(t)
        case RizEaseType.InQuart:
            return ease_in_quart(t)
        case RizEaseType.OutQuart:
            return ease_out_quart(t)
        case RizEaseType.InOutQuart:
            return ease_in_out_quart(t)
        case RizEaseType.InQuint:
            return ease_in_quint(t)
        case RizEaseType.OutQuint:
            return ease_out_quint(t)
        case RizEaseType.InOutQuint:
            return ease_in_out_quint(t)
        case RizEaseType.Zero:
            return 0.0
        case RizEaseType.One:
            return 1.0
        case RizEaseType.InCirc:
            return ease_in_circ(t)
        case RizEaseType.OutCirc:
            return ease_out_circ(t)
        case RizEaseType.OutSine:
            return ease_out_sine(t)
        case RizEaseType.InSine:
            return ease_in_sine(t)
        case _:
            return t
