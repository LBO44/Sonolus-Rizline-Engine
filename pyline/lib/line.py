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
from pyline.lib.layout import (
    X_JUDGE,
    X_LINE_DISAPPEAR,
    X_SPAWN,
    challenge_theme,
    floor_to_x,
)
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
    y_pos: float
    ease_type: int
    color: int

    floor_position: float
    target_time: float

    @property
    def pos(self) -> Vec2: ...

    @property
    def next(self) -> LinePoint: ...
    @property
    def is_last_point(self) -> bool: ...

    @property
    def line(self) -> Line: ...
    @property
    def canvas(self) -> Canvas: ...


def get_point_pos(point: LinePoint) -> Vec2:
    x = floor_to_x(point.floor_position, point.canvas.floor_position)
    unscaled_y = 2 * (point.y_pos + point.canvas.y_pos - camera.y_pos)
    y = camera.y_pos + (unscaled_y - camera.y_pos) * camera.scale
    return Vec2(x, y)


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

    if judge_ring.has_transition:
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
                    challenge_theme(Vec2(X_JUDGE, point.pos.y))
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


def draw_join(
    pos: Vec2,
    a: float,
    z_index: float,
    mode: DrawMode,
    base_color: int,
    top_color: int,
    global_transition_top_alpha: float = -1,
):
    if pos.x < X_SPAWN or pos.x > X_LINE_DISAPPEAR:
        return
    LINE_WIDTH = 0.01 * camera.scale

    dist = min(X_JUDGE - pos.x, pos.x - X_SPAWN)
    fade = remap_clamped(0, 0.2, 0.25, 1, dist)

    alpha = a * fade

    disc_rect = Rect.from_margin(LINE_WIDTH).translate(pos)
    match mode:
        case DrawMode.Simple:
            Skin.line_discs[base_color].draw(disc_rect, z_index, alpha)
        case DrawMode.Local:
            Skin.line_discs[base_color].draw(disc_rect, z_index, alpha)
        case DrawMode.Global:
            Skin.line_discs[base_color].draw(disc_rect, z_index, 1)
            Skin.line_discs[top_color].draw(
                disc_rect, z_index + z_offset(0, 1), global_transition_top_alpha
            )
            if alpha < 1:
                Skin.background[challenge_theme(pos)].draw(
                    disc_rect, z_index + z_offset(0, 2), 1 - alpha
                )


def draw_line(point: LinePoint) -> None:
    """
    Draw a (curved) line between 2 points
    For now ignore the case where line has both global (line color) transition and local (line point) gradient
    since it's pretty rare and not that much noticeable
    """

    a = point.pos
    b = point.next.pos

    if (
        (X_SPAWN > a.x and X_SPAWN > b.x)
        or (1 < a.y and 1 < b.y)
        or (-1 > a.y and -1 > b.y)
    ):
        return

    if point.alpha == 0 and point.next.alpha == 0:
        return

    z = LAYER_LINE
    mode = DrawMode.Simple
    base_color_index = point.color
    top_color_index = point.next.color
    global_transition_top_alpha = -1

    if point.color != point.next.color:
        mode = DrawMode.Local

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

            if line_color.has_transition:
                mode = DrawMode.Global
                z = LAYER_LINE_GLOBAL
                top_color_index = line_color.end_color
                global_transition_top_alpha = unlerp_clamped(
                    line_color.time, line_color.next_time, time()
                )
            else:
                mode = DrawMode.Simple

    # Looks like rizline draw lines using rounded extremeties
    def draw_join_curr(pos, alpha):
        draw_join(
            pos,
            alpha,
            z + z_offset(point.line.index, -5),
            mode,
            base_color_index,
            top_color_index,
            global_transition_top_alpha,
        )

    draw_join_curr(a, point.alpha)
    if point.next.is_last_point:
        draw_join_curr(b, point.next.alpha)

    base_sprite = Skin.lines[base_color_index]
    top_sprite = Skin.lines[top_color_index]

    # vertical/horizontal lines also need fade out and gradients
    if a.x > b.x:
        draw_curved_line(
            a=a,
            b=b,
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
        if mode == DrawMode.Local:
            base_sprite @= Skin.lines[top_color_index]
            top_sprite @= Skin.lines[base_color_index]
        draw_curved_line(
            a=b,
            b=a,
            alpha_a=point.next.alpha,
            alpha_b=point.alpha,
            ease_type=point.ease_type,
            z_index=z + z_offset(point.line.index),
            base_sprite=base_sprite,
            top_sprite=top_sprite,
            mode=mode,
            global_transition_top_alpha=global_transition_top_alpha,
        )


def lerp_vec(a: Vec2, b: Vec2, x: float, ease_type: int) -> Vec2:
    return Vec2(lerp(a.x, b.x, x), lerp(a.y, b.y, ease(x, ease_type)))


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
    if a.x == b.x:
        if a.x < X_SPAWN or a.x > X_LINE_DISAPPEAR:
            return
        t0, t1 = 0, 1
    else:
        t0 = unlerp_clamped(a.x, b.x, X_LINE_DISAPPEAR)
        t1 = unlerp_clamped(a.x, b.x, X_SPAWN)
        # #NOTE: outside the area, very important for perf
        if t0 >= t1:
            return

    lenght = (a - b).magnitude
    segments = (
        1
        if a.x == b.x and alpha_a == alpha_b
        else (
            32
            if lenght > 1
            else (
                16 if lenght > 0.5 or alpha_a != alpha_b else (8 if lenght > 0.2 else 4)
            )
        )
    )

    """
    Draw each segment/quad of the line in a loop
    We use miter vectors (miter = average of the normals of the 2 segment, the diagonal of the gap between the 2 if they were rects),
    so that the segments connect perfectly (if we used simple rects there would be a lot more gaps in curves)

    For optimization, end miter = start miter of next segment, so we just to calculate the first start miter before the loop,
    then in the loop we just need to calculate the end miter (which will because the start miter in the next iteration)
    """

    LINE_WIDTH = 0.01 * camera.scale

    # First quad indexes
    u_step = 1 / segments

    u_start = 0
    u_end = u_step

    # Map the quad indexes to the clipped line
    t_start = t0
    t_end = lerp(t0, t1, u_end)

    # Map it back to real coordinates,
    # start (= end of previous) and end (= start of next) of the current segment
    start_point = lerp_vec(a, b, t_start, ease_type)
    end_point = lerp_vec(a, b, t_end, ease_type)
    next_point = +Vec2

    segment_normal = (
        end_point - start_point
    ).normalize_or_zero().orthogonal() * LINE_WIDTH
    next_normal = +Vec2

    start_mitter = segment_normal
    end_miter = +Vec2

    for i in range(segments):
        alpha = lerp(alpha_a, alpha_b, u_start)

        dist = min(X_JUDGE - start_point.x, end_point.x - X_SPAWN)
        fade = remap_clamped(0, 0.2, 0.25, 1, dist)

        final_alpha = alpha * fade

        if i < segments - 1:
            u_next = u_end + u_step
            t_next = lerp(t0, t1, u_next)
            next_point @= lerp_vec(a, b, t_next, ease_type)

            next_normal @= (
                next_point - end_point
            ).normalize_or_zero().orthogonal() * LINE_WIDTH
            end_miter @= (segment_normal + next_normal) * 0.5
        else:
            end_miter @= segment_normal

        quad = Quad(
            Vec2(start_point.x + start_mitter.x, start_point.y + start_mitter.y),
            Vec2(start_point.x - start_mitter.x, start_point.y - start_mitter.y),
            Vec2(end_point.x - end_miter.x, end_point.y - end_miter.y),
            Vec2(end_point.x + end_miter.x, end_point.y + end_miter.y),
        )

        # update for the next iteration
        start_point @= end_point
        start_mitter @= end_miter
        end_point @= next_point
        segment_normal @= next_normal
        u_start = u_end
        u_end += u_step

        if final_alpha <= 0:
            continue

        match mode:
            case DrawMode.Simple:
                base_sprite.draw(quad, z_index, final_alpha)
            case DrawMode.Global:
                base_sprite.draw(quad, z_index, 1)
                top_sprite.draw(
                    quad, z_index + z_offset(0, 1), global_transition_top_alpha
                )
                if final_alpha < 1:
                    Skin.background[challenge_theme(end_point)].draw(
                        quad, z_index + z_offset(0, 2), 1 - final_alpha
                    )
            case DrawMode.Local:
                base_sprite.draw(quad, z_index, 1)
                top_sprite.draw(quad, z_index + z_offset(0, 1), u_start)
                if final_alpha < 1:
                    Skin.background[challenge_theme(end_point)].draw(
                        quad, z_index + z_offset(0, 2), 1 - final_alpha
                    )
