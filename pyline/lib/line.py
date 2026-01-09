from __future__ import annotations

from enum import IntEnum
from typing import Protocol

from sonolus.script.interval import clamp, lerp, remap, remap_clamped, unlerp_clamped
from sonolus.script.quad import Quad, Rect
from sonolus.script.runtime import time
from sonolus.script.sprite import Sprite
from sonolus.script.vec import Vec2

from pyline.lib.ease import Canvas, camera, ease
from pyline.lib.layer import LAYER_JUDGE_RING, LAYER_LINE, LAYER_LINE_GLOBAL, z_offset
from pyline.lib.layout import X_JUDGE, X_LINE_DISAPPEAR, X_SPAWN, is_in_challenge
from pyline.lib.options import Options
from pyline.lib.skin import Skin

JUDGE_RING_RADIUS = 0.11


class ColorChange(Protocol):
    start_alpha: float
    end_alpha: float
    start_color: int
    end_color: int
    has_transition: bool

    time: float
    next_time: float


class Line(Protocol):
    @property
    def index(self) -> int: ...
    @property
    def y_at_judge_line(self) -> float: ...
    @property
    def judge_ring(self) -> ColorChange: ...
    @property
    def line_color(self) -> ColorChange: ...
    @property
    def no_judge_ring(self) -> bool: ...
    @property
    def has_line_color(self) -> bool: ...


class LinePoint(Protocol):
    beat: float
    alpha: float
    ease_type: int
    color: int

    floor_position: float
    target_time: float

    @property
    def pos(self) -> Vec2: ...

    @property
    def next(self) -> LinePoint: ...

    @property
    def line(self) -> Line: ...
    @property
    def canvas(self) -> Canvas: ...


def get_y_at_judge_line(point: LinePoint) -> float:
    """get the y value of the intersection between the line and the judge line to know where to draw the judge ring"""

    t = clamp((X_JUDGE - point.pos.x) / (point.next.pos.x - point.pos.x), 0, 1)
    e = ease(t, point.ease_type)
    return lerp(point.pos.y, point.next.pos.y, e)


def draw_judge_ring(point: LinePoint) -> None:
    """
    If static color: draw one sprite with alpha
    If color transition: draw current color (base) with alpha 1 and next sprite (top) on top with progressing alpha
    If the transition has transparency (true_alpha!=1) draw background color on top (1-true_alpha)
    """
    if point.line.no_judge_ring:
        return

    judge_ring = point.line.judge_ring

    base_sprite = Skin.judge_rings[judge_ring.start_color]

    base_alpha = judge_ring.start_alpha
    layout = Rect.from_margin(
        JUDGE_RING_RADIUS * camera.scale * Options.note_size
    ).translate(Vec2(X_JUDGE, get_y_at_judge_line(point)))

    if Options.color_transition and judge_ring.has_transition:
        top_alpha = unlerp_clamped(judge_ring.time, judge_ring.next_time, time())

        true_alpha = lerp(
            judge_ring.start_alpha,
            judge_ring.end_alpha,
            top_alpha,
        )

        if true_alpha == 0:
            return

        if judge_ring.start_color == judge_ring.end_color:
            base_alpha = true_alpha

        else:
            base_alpha = 1

            top_sprite = Skin.judge_rings[judge_ring.end_color]
            top_sprite.draw(
                layout,
                LAYER_JUDGE_RING + z_offset(-point.line.index, 1),
                top_alpha,
            )

            if true_alpha != 1:
                Skin.judge_ring_background[
                    is_in_challenge(Vec2(X_JUDGE, point.pos.y))
                ].draw(
                    layout,
                    LAYER_JUDGE_RING + z_offset(-point.line.index, 2),
                    1 - true_alpha,
                )

    base_sprite.draw(
        layout,
        LAYER_JUDGE_RING + z_offset(-point.line.index),
        base_alpha,
    )


class DrawMode(IntEnum):
    Simple = 1
    Global = 2
    Local = 3


def draw_line(point: LinePoint) -> None:
    """
    Draw a (curved) line between 2 points
    For now ignore the case where line has both global (line color) transition and local (line point) gradient
    since it's pretty rare and not that much noticeable
    """

    if (
        (X_SPAWN > point.pos.x and X_SPAWN > point.next.pos.x)
        or (1 < point.pos.y and 1 < point.next.pos.y)
        or (-1 > point.pos.y and -1 > point.next.pos.y)
    ):
        return

    if point.alpha == 0 and point.next.alpha == 0:
        return

    z = LAYER_LINE
    mode = DrawMode.Simple
    base_color_index = point.color
    top_color_index = point.next.color
    global_transition_top_alpha = -1

    if point.line.has_line_color:
        line_color = point.line.line_color

        line_color_alpha = (
            remap(
                line_color.time,
                line_color.next_time,
                line_color.start_alpha,
                line_color.end_alpha,
                time(),
            )
            if line_color.has_transition
            else line_color.start_alpha
        )

        # Only use line color if it's really strong  (incorrect but good enough)
        if line_color_alpha > 0.8:
            base_color_index = line_color.start_color

            if Options.color_transition and line_color.has_transition:
                mode = DrawMode.Global
                z = LAYER_LINE_GLOBAL
                top_color_index = line_color.end_color
                global_transition_top_alpha = unlerp_clamped(
                    line_color.time, line_color.next_time, time()
                )

        elif Options.color_transition and point.color != point.next.color:
            mode = DrawMode.Local

    base_sprite = Skin.lines[base_color_index]
    top_sprite = Skin.lines[top_color_index]

    # Horizontal line, not supported by draw curved, missing local gradient (not that much needed)
    if point.pos.x == point.next.pos.x:
        line_layout = points_to_quad(point.pos, point.next.pos)

        if mode == DrawMode.Global:
            base_sprite.draw(line_layout, z + z_offset(point.line.index), 1)
            top_sprite.draw(
                line_layout,
                z + z_offset(point.line.index, 1),
                global_transition_top_alpha,
            )
        else:
            base_sprite.draw(line_layout, z + z_offset(point.line.index), point.alpha)

    # Other lines
    else:
        # vertical lines also need fade out, drawCurvedLine can't handle horizontal lines
        if point.pos.x > point.next.pos.x:
            draw_curved_line(
                a=point.pos,
                b=point.next.pos,
                alpha_a=point.alpha,
                alpha_b=point.next.alpha,
                ease_type=point.ease_type,
                z_index=z + z_offset(point.line.index),
                base_sprite=base_sprite,
                top_sprite=top_sprite,
                mode=mode,
                global_transition_top_alpha=global_transition_top_alpha,
            )
        else:
            draw_curved_line(
                b=point.pos,
                a=point.next.pos,
                alpha_b=point.alpha,
                alpha_a=point.next.alpha,
                ease_type=point.ease_type,
                z_index=z + z_offset(point.line.index),
                base_sprite=base_sprite,
                top_sprite=top_sprite,
                mode=mode,
                global_transition_top_alpha=global_transition_top_alpha,
            )


def draw_curved_line(
    a: Vec2,
    b: Vec2,
    alpha_a: float,
    alpha_b: float,
    ease_type: int,
    z_index: float,
    base_sprite: Sprite,
    top_sprite: Sprite,
    mode: DrawMode = DrawMode.Simple,
    global_transition_top_alpha: float = -1,
) -> None:
    """
    Draw a curved line between 2 Vec2, splitting it into segments, with local alpha gradient
    mode: simple: Draw Just one sprite
    mode: global: color transition over time, 2 sprites + 1 for transparency
    mode: local: color gradient from a to b, 2 sprites + 1 for transparency
    """
    # clip the line between the 2 limits
    t0 = unlerp_clamped(a.x, b.x, X_LINE_DISAPPEAR)
    t1 = unlerp_clamped(a.x, b.x, X_SPAWN)

    # outside the area
    if t0 >= t1:
        return

    lengh = (a - b).magnitude
    segments = (
        32
        if lengh > 1
        else (16 if lengh > 0.5 or alpha_a != alpha_b else (8 if lengh > 0.2 else 4))
    )

    for i in range(segments):
        # split the clipped line into multiple quads
        u0 = i / segments
        u1 = (i + 1) / segments

        # Map the quad indexes to the clipped line
        ta = lerp(t0, t1, u0)
        tb = lerp(t0, t1, u1)

        # Map it back to real coordinates
        af = Vec2(
            lerp(a.x, b.x, ta),
            lerp(a.y, b.y, ease(ta, ease_type)),
        )
        bf = Vec2(
            lerp(a.x, b.x, tb),
            lerp(a.y, b.y, ease(tb, ease_type)),
        )

        alpha = lerp(alpha_a, alpha_b, u0)

        dist = min(X_JUDGE - af.x, bf.x - X_SPAWN)
        fade = remap_clamped(0, 0.2, 0.25, 1, dist)

        final_alpha = alpha * fade
        if final_alpha <= 0:
            continue

        quad = points_to_quad(af, bf)
        match mode:
            case DrawMode.Simple:
                base_sprite.draw(quad, z_index, final_alpha)
            case DrawMode.Global:
                base_sprite.draw(quad, z_index, 1)
                top_sprite.draw(
                    quad, z_index + z_offset(0, 1), global_transition_top_alpha
                )
                if final_alpha < 1:
                    Skin.line_background[is_in_challenge(af)].draw(
                        quad, z_index + z_offset(0, 2), 1 - final_alpha
                    )
            case DrawMode.Local:
                base_sprite.draw(quad, z_index, 1)
                top_sprite.draw(quad, z_index + z_offset(0, 1), u0)
                if final_alpha < 1:
                    Skin.line_background[is_in_challenge(af)].draw(
                        quad, z_index + z_offset(0, 2), 1 - final_alpha
                    )


def points_to_quad(a: Vec2, b: Vec2) -> Quad:
    """Get the quad that connect 2 coordinates"""
    LINE_WIDTH = 0.01
    x = b.x - a.x
    y = b.y - a.y

    length = (a - b).magnitude

    nx = (-y / length) * LINE_WIDTH
    ny = (x / length) * LINE_WIDTH

    return Quad(
        Vec2(a.x + nx, a.y + ny),
        Vec2(a.x - nx, a.y - ny),
        Vec2(b.x - nx, b.y - ny),
        Vec2(b.x + nx, b.y + ny),
    )
