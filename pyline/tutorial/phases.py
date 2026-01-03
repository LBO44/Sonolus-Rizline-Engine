from collections.abc import Callable

from sonolus.script.globals import level_memory
from sonolus.script.interval import remap_clamped, unlerp, unlerp_clamped
from sonolus.script.quad import Rect
from sonolus.script.sprite import Sprite
from sonolus.script.vec import Vec2

from pyline.lib.layout import X_JUDGE, X_SPAWN
from pyline.lib.note import (
    NOTE_DRAG_RADIUS,
    NOTE_TAP_RADIUS,
    NoteKind,
    draw_hold_note,
    play_note_particle,
    play_note_sfx,
)
from pyline.lib.options import Options
from pyline.lib.skin import Skin
from pyline.tutorial.instructions import Instructions
from pyline.tutorial.painting import paint_tap_motion

FALL_END = 1.5
FROZEN_DURATION = 4
FROZEN_END = FALL_END + FROZEN_DURATION


def draw_falling_note(radius: float, skin: Sprite, t: float) -> None:
    x = remap_clamped(0, FALL_END, X_SPAWN, X_JUDGE, t)
    layout = Rect.from_margin(radius * Options.note_size).translate(Vec2(x, 0))
    skin.draw(layout, 30)


def falling_motion(t: float) -> None:
    paint_tap_motion(
        Vec2(0.8, 0.5),
        unlerp(0, FROZEN_DURATION / 4, (t - FALL_END) % 1),
    )


def tap_phase(t: float) -> bool:
    Instructions.tap.show()

    if t <= FROZEN_END:
        draw_falling_note(NOTE_TAP_RADIUS, Skin.note_tap[0], t)

    if t < FALL_END:
        return False

    if t < FROZEN_END:
        falling_motion(t)
        return False

    play_note_particle(Vec2(0, 0))
    play_note_sfx(NoteKind.TAP)
    return True


def drag_phase(t: float) -> bool:
    Instructions.drag.show()

    paint_tap_motion(
        Vec2(0.8, 0.5),
        unlerp_clamped(0, FALL_END - 1, t - 0.5),
        False,
    )

    if t <= FROZEN_END - 2:
        draw_falling_note(NOTE_DRAG_RADIUS, Skin.note_drag, t)
        return False

    play_note_particle(Vec2(0, 0))
    play_note_sfx(NoteKind.DRAG)
    return True


@level_memory
class HoldPhaseState:
    played_tap_particles: bool


def hold_phase(t: float) -> bool:
    Instructions.hold.show()

    if t <= FROZEN_END:
        HoldPhaseState.played_tap_particles = False
        x = remap_clamped(0, FALL_END, X_SPAWN, X_JUDGE, t)
        draw_hold_note(0, x, x - 1, 30)

        if t >= FALL_END:
            falling_motion(t)

        return False

    if t < FROZEN_END + 1:
        if not HoldPhaseState.played_tap_particles:
            play_note_particle(Vec2(0, 0))
            play_note_sfx(NoteKind.TAP)
            HoldPhaseState.played_tap_particles = True

        x = remap_clamped(FROZEN_END, FROZEN_END + 1, X_JUDGE, X_JUDGE + 1, t)
        draw_hold_note(0, x, x - 1, 30)
        paint_tap_motion(Vec2(0.8, 0.5), 0.75)
        return False

    play_note_particle(Vec2(0, 0))
    return True


PHASES: tuple[Callable[[float], bool], ...] = (
    tap_phase,
    drag_phase,
    hold_phase,
)
