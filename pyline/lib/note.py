from enum import IntEnum
from math import floor, sin
from typing import Protocol

from sonolus.script.archetype import PlayArchetype, WatchArchetype
from sonolus.script.bucket import Bucket, JudgmentWindow
from sonolus.script.easing import ease_in_back, ease_in_quad, ease_out_cubic
from sonolus.script.effect import Effect
from sonolus.script.interval import clamp, remap, remap_clamped
from sonolus.script.quad import Rect
from sonolus.script.runtime import time
from sonolus.script.sprite import Sprite
from sonolus.script.vec import Vec2

from pyline.lib.buckets import DRAG_WINDOW, TAP_WINDOW, Buckets
from pyline.lib.ease import remap_ease
from pyline.lib.effect import Effects
from pyline.lib.layer import (
    LAYER_HOLD_NOTE,
    LAYER_HOLD_NOTE_MISS_EFFECT,
    LAYER_MISS_EFFECT,
    LAYER_NOTE,
    z_offset,
)
from pyline.lib.layout import (
    X_JUDGE,
    X_NOTE_DISAPPEAR,
    X_SPAWN,
    is_in_challenge,
)
from pyline.lib.line import LinePoint
from pyline.lib.options import Options
from pyline.lib.particle import Particles
from pyline.lib.skin import Skin
from pyline.watch.ease_events import camera

NOTE_HOLD_RADIUS = 0.07 * 1.2
NOTE_TAP_RADIUS = 0.07 * 1.2
NOTE_DRAG_RADIUS = 0.045 * 1.2

HOLD_FADE_LENGTH = 0.14
NOTE_HOLD_DESPAWN_DURATION = 0.25
NOTE_HOLD_MISS_SPEED = 5
NOTE_MISS_EFFECT_DURATION = 0.6


# only used to define life
class NoteType(IntEnum):
    NORMAL = 0
    CHALLENGE = 1


class ChartDifficulty(IntEnum):
    EZ = 0
    HD = 1
    IN = 2  # AT and IN have same file


class NoteKind(IntEnum):
    TAP = 0
    DRAG = 1
    HOLD_START = 2


class Note(Protocol):
    beat: float
    target_time: float
    kind: NoteKind

    @property
    def index(self) -> int: ...

    @property
    def point(self) -> LinePoint: ...
    @property
    def pos(self) -> Vec2: ...
    @property
    def is_in_challenge(self) -> bool: ...


class HoldTailNote(Protocol):
    @property
    def index(self) -> int: ...

    @property
    def pos_y(self) -> float: ...
    @property
    def tail_x(self) -> float: ...
    @property
    def head_x(self) -> float: ...


def schedule_note_sfx(kind: NoteKind, target_time: float) -> None:
    if not Options.sfx:
        return

    effect = Effect(-1)
    match kind:
        case NoteKind.TAP | NoteKind.HOLD_START:
            effect @= Effects.tap
        case NoteKind.DRAG:
            effect @= Effects.drag
    effect.schedule(target_time, 0)


def play_note_sfx(kind: NoteKind) -> None:
    if (not Options.sfx) or Options.auto_sfx:
        return

    effect = Effect(-1)
    match kind:
        case NoteKind.TAP | NoteKind.HOLD_START:
            effect @= Effects.tap
        case NoteKind.DRAG:
            effect @= Effects.drag
    effect.play(0)


def get_note_pos(note: Note) -> Vec2:
    x = remap(
        note.point.beat,
        note.point.next.beat,
        note.point.pos.x,
        note.point.next.pos.x,
        note.beat,
    )
    y = remap_ease(
        note.point.beat,
        note.point.next.beat,
        note.point.pos.y,
        note.point.next.pos.y,
        note.beat,
        note.point.ease_type,
    )
    return Vec2(x, y)


def draw_note(note: Note) -> None:
    if note.kind == NoteKind.HOLD_START:
        return
    if note.pos.x < X_SPAWN:
        return

    sprite = Sprite(-1)
    radius = camera.scale * Options.note_size

    dist = min(X_NOTE_DISAPPEAR - note.pos.x, note.pos.x - X_SPAWN)
    fade = remap_clamped(0, 0.1, 0, 1, dist)

    match note.kind:
        case NoteKind.DRAG:
            radius *= NOTE_DRAG_RADIUS
            sprite @= Skin.note_drag
        case NoteKind.TAP:
            radius *= NOTE_TAP_RADIUS
            sprite @= Skin.note_tap[note.is_in_challenge]

    layout = Rect.from_margin(radius).translate(note.pos)
    sprite.draw(layout, LAYER_NOTE + z_offset(note.index), fade)


def draw_hold_note(
    pos_y: float, head_x: float, tail_x: float, draw_index: float
) -> None:
    """Hold head still need to be drawn after head despawn,
    so hold drawing logic is fully handled by hold tail"""
    head_pos = Vec2(head_x, pos_y)
    challenge = is_in_challenge(head_pos)

    z = LAYER_HOLD_NOTE

    radius = NOTE_HOLD_RADIUS * camera.scale * Options.note_size

    if tail_x > X_NOTE_DISAPPEAR or head_x < X_SPAWN:
        return

    head_dist = min(X_NOTE_DISAPPEAR - head_x, head_x - X_SPAWN)
    head_fade = remap_clamped(0, 0.05, 0, 1, head_dist)

    head_layout = Rect.from_margin(radius).translate(head_pos)

    Skin.note_hold.draw(head_layout, z + z_offset(draw_index), head_fade)
    Skin.note_hold_head_decorator.draw(
        head_layout, z + z_offset(draw_index, 2), head_fade
    )

    line_left = clamp(tail_x - radius * 0.5, X_SPAWN, X_NOTE_DISAPPEAR)
    line_right = clamp(head_x - radius * 0.5, X_SPAWN, X_NOTE_DISAPPEAR)

    line_split_left = min(line_left + HOLD_FADE_LENGTH, line_right)

    z_connctor = z + z_offset(draw_index, 1)

    if head_x <= X_NOTE_DISAPPEAR - radius:
        line_split_right = line_right
    else:
        line_split_right = max(line_right - HOLD_FADE_LENGTH, line_split_left)
        fade_right_layout = Rect(
            t=radius + pos_y,
            b=-radius + pos_y,
            r=line_split_right,
            l=line_right,
        )
        Skin.note_hold_tail[challenge].draw(fade_right_layout, z_connctor, 1)

    fade_left_layout = Rect(
        t=radius + pos_y,
        b=-radius + pos_y,
        l=line_left,
        r=line_split_left,
    )

    line_layout = Rect(
        t=radius + pos_y,
        b=-radius + pos_y,
        l=line_split_left,
        r=line_split_right,
    )

    Skin.note_hold_connector[challenge].draw(line_layout, z_connctor, 1)
    Skin.note_hold_tail[challenge].draw(fade_left_layout, z_connctor, 1)


def draw_hold_note_despawn(start_time: float, pos_y: float) -> None:
    Skin.note_hold.draw(
        Rect.from_margin(
            remap(
                start_time,
                start_time + NOTE_HOLD_DESPAWN_DURATION,
                NOTE_HOLD_RADIUS,
                0,
                time(),
            )
        ).translate(Vec2(X_JUDGE, pos_y)),
        LAYER_HOLD_NOTE,
        1,
    )


def draw_hold_note_miss_effect(
    start_time: float, pos_y: float, start_tail_x: float
) -> None:
    z = LAYER_HOLD_NOTE_MISS_EFFECT
    radius = NOTE_HOLD_RADIUS * camera.scale * Options.note_size

    x_offset = NOTE_HOLD_MISS_SPEED * (time() - start_time)

    head_x = X_JUDGE + x_offset
    tail_x = start_tail_x + x_offset

    a = clamp((X_NOTE_DISAPPEAR - start_tail_x + x_offset) / 0.04, 0, 1)
    draw_hold_note(pos_y, head_x, tail_x, draw_index=start_time)


def draw_miss_effect(start_time: float, start_y: float) -> None:
    t = (time() - start_time) / NOTE_MISS_EFFECT_DURATION
    Skin.miss_effect.draw(
        Rect(t=start_y + 0.1, b=start_y - 0.1, l=X_SPAWN, r=X_NOTE_DISAPPEAR),
        LAYER_MISS_EFFECT,
        1 - t * 1.5,
    )

    cross_quad = (
        Rect.from_margin(0.075)
        .as_quad()
        .rotate_centered(sin(start_time * start_y * 11.7) * (1.0 - t))
        .translate(
            Vec2(
                ease_in_back(t) * 0.5,
                ease_out_cubic(t) * sin(start_time * start_y * 11.7) * 0.15,
            )
        )
        .translate(Vec2(-0.4, start_y))
    )

    Skin.miss_cross.draw(
        cross_quad, LAYER_MISS_EFFECT + z_offset(0, 1), 1 - ease_in_quad(t)
    )


def play_note_particle(pos: Vec2) -> None:
    if not Options.particle:
        return

    layout = Rect.from_margin(0.3 * Options.particle_size).translate(
        Vec2(X_JUDGE, pos.y)
    )
    if is_in_challenge(pos):
        Particles.challenge.spawn(layout, 0.7)
        Particles.challenge_extended.spawn(layout, 0.7)
    else:
        Particles.normal.spawn(layout, 0.7)


def play_bad_particle(pos: Vec2) -> None:
    if not Options.particle:
        return

    layout = Rect.from_margin(0.35 * Options.particle_size).translate(pos)
    Particles.bad.spawn(layout, 0.55)


def get_note_bucket(kind: NoteKind) -> Bucket:
    result = Bucket(-1)
    match kind:
        case NoteKind.TAP:
            result @= Buckets.tap
        case NoteKind.DRAG:
            result @= Buckets.drag
        case NoteKind.HOLD_START:
            result @= Buckets.hold_start
    return result


def get_note_judgement_window(kind: NoteKind) -> JudgmentWindow:
    result = +JudgmentWindow
    match kind:
        case NoteKind.TAP | NoteKind.HOLD_START:
            result @= TAP_WINDOW
        case NoteKind.DRAG:
            result @= DRAG_WINDOW
    return result


def init_note_life(
    archetype: type[PlayArchetype | WatchArchetype],
    challenge_hit_count: int,
    difficulty: ChartDifficulty,
):
    # from rizwiki.cn
    good = 0
    miss = 0
    match difficulty:
        case ChartDifficulty.EZ:
            good = -13  # -13.4
            miss = -67
        case ChartDifficulty.HD:
            good = -7  # 6.8
            miss = -34
        case ChartDifficulty.IN:
            good = -12
            miss = -60

    match archetype.key:
        case NoteType.NORMAL:
            archetype.life.update(
                good_increment=good,
                miss_increment=miss,
            )
        case NoteType.CHALLENGE:
            archetype.life.update(
                perfect_increment=floor(1300 / challenge_hit_count),
                great_increment=floor(1100 / challenge_hit_count),
                good_increment=good,
                miss_increment=miss,
            )
