from math import pi

from sonolus.script.interval import interp_clamped, lerp_clamped
from sonolus.script.runtime import runtime_ui
from sonolus.script.vec import Vec2

from pyline.tutorial.instructions import InstructionIcons


def instruction_scale() -> float:
    return runtime_ui().instruction_config.scale


def instruction_alpha() -> float:
    return runtime_ui().instruction_config.alpha


def _paint_tap(
    pos: Vec2,
    progress: float,
    a: float = 1,
):
    angle = lerp_clamped(pi / 6, pi / 3, progress)
    position = Vec2(0, -1).rotate(pi / 3) * (0.25 * instruction_scale()) + pos
    InstructionIcons.hand.paint(
        position=Vec2(0, 1).rotate(angle) * 0.25 * instruction_scale() + position,
        size=0.25 * instruction_scale(),
        rotation=(270 * angle) / pi,
        z=0,
        a=a * instruction_alpha(),
    )


def paint_tap_motion(pos: Vec2, progress: float, fade_out: bool = True):
    if fade_out:
        a = interp_clamped(
            (0, 0.05, 0.75, 0.95),
            (0, 1, 1, 0),
            progress,
        )
    else:
        a = interp_clamped(
            (0, 0.25),
            (0, 1),
            progress,
        )
    tap_progress = interp_clamped(
        (0.25, 0.75),
        (0, 1),
        progress,
    )
    _paint_tap(pos, tap_progress, a)
