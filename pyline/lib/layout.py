from sonolus.script.debug import notify
from sonolus.script.globals import level_memory
from sonolus.script.interval import Interval, lerp, remap, unlerp
from sonolus.script.quad import Rect
from sonolus.script.runtime import is_tutorial, runtime_ui, screen, time
from sonolus.script.sprite import Sprite
from sonolus.script.vec import Vec2

from pyline.lib.ease import CanvasSpeed, camera
from pyline.lib.layer import (
    LAYER_BACKGROUND,
    LAYER_BACKGROUND_FADE_JUDGE,
    LAYER_BACKGROUND_FADE_SPAWN,
    LAYER_BACKGROUND_OVER,
    z_offset,
)
from pyline.lib.options import Options
from pyline.lib.skin import Skin

X_SPAWN = screen().l * 0.84
X_JUDGE = screen().r * 0.477

X_LINE_DISAPPEAR = X_JUDGE + 0.12
X_NOTE_DISAPPEAR = screen().r * 0.8


@level_memory
class Challenge:
    inside: Interval
    transition: Interval
    theme_index: int


def camera_scale_x(x: float, scale: float) -> float:
    return X_JUDGE + (x - X_JUDGE) * scale


def draw_ui() -> None:
    """draw coloured rects behind menu and metric"""
    if not Options.colored_ui:
        return

    ui = runtime_ui()

    menu_size = 0.15 * ui.menu_config.scale
    menu_left = screen().tl.x + 0.085
    menu_right = screen().tl.y - 0.075
    menu_rect = Rect(
        t=menu_right, r=menu_left + menu_size, b=menu_right - menu_size, l=menu_left
    )

    bar_w = screen().h - (0.2 + menu_size)
    bar_h = 0.15 * ui.primary_metric_config.scale
    anchor_pt = screen().bl + Vec2(0.085, 0.075)
    metric_rect = Rect(
        t=anchor_pt.y + bar_w, r=anchor_pt.x + bar_h, b=anchor_pt.y, l=anchor_pt.x
    )

    theme = Challenge.theme_index if time() in Challenge.inside else 0

    Skin.ui_backgrounds[theme].draw(menu_rect, 999, ui.menu_config.alpha)
    Skin.ui_backgrounds[theme].draw(metric_rect, 999, ui.secondary_metric_config.alpha)


def draw_background() -> None:
    """draw the coloured background with transition animations"""

    if Options.background_opacity == 0:
        return

    # ideally should cover up to the side of the screen
    fade_layout = Rect.from_margin(screen().t, screen().t * 0.625)
    fade_spawn_layout = fade_layout.translate(Vec2(camera.scaled_x_spawn + 0.1, 0))
    fade_judge_layout = fade_layout.scale(Vec2(-1, 1)).translate(
        Vec2(camera.scaled_x_note_disappear - 0.05, 0)
    )
    theme = -1
    bg_layout = screen().scale(Vec2(2, 2))  # to cover notch

    if i := time() in Challenge.inside:
        theme = Challenge.theme_index

    if o := time() not in Challenge.transition:
        theme = 0

    if o or i:
        Skin.background[theme].draw(
            bg_layout, LAYER_BACKGROUND, Options.background_opacity
        )
        if Options.background_opacity == 1:
            Skin.background_fade[theme].draw(
                fade_spawn_layout,
                LAYER_BACKGROUND_FADE_SPAWN,
                1.5,
            )
            Skin.background_fade[theme].draw(
                fade_judge_layout,
                LAYER_BACKGROUND_FADE_JUDGE,
                1.5,
            )
        return

    under = +Sprite
    over = +Sprite
    trans_rect = +Rect
    # challenge start transition animation
    if time() <= Challenge.inside.start:
        under @= Skin.background[0]
        over @= Skin.background_circle[Challenge.theme_index]
        t0, t1 = Challenge.transition.start, Challenge.inside.start
        trans_progress = remap(t0, t1, 0, screen().w, time())
        trans_rect @= Rect.from_margin(trans_progress).translate(screen().mr)

    # challenge end transition animation
    else:
        under @= Skin.background[Challenge.theme_index]
        over @= Skin.background_circle[0]
        t0, t1 = Challenge.inside.end, Challenge.transition.end
        trans_progress = remap(t0, t1, 0, screen().w, time())
        trans_rect @= Rect.from_margin(trans_progress).translate(screen().ml)

    if Options.background_opacity == 1:
        under.draw(bg_layout, LAYER_BACKGROUND, 1)
        over.draw(trans_rect, LAYER_BACKGROUND_OVER, 1)
    else:
        a = unlerp(t0, t1, time()) * Options.background_opacity
        under.draw(bg_layout, LAYER_BACKGROUND, Options.background_opacity - a)
        over.draw(bg_layout, LAYER_BACKGROUND + z_offset(1), a)


def is_in_challenge(pos: Vec2) -> bool:
    """Takes into account the transition, hence why we can't just use archetype name"""
    if is_tutorial():
        return False

    if time() in Challenge.inside:
        return True

    if time() not in Challenge.transition:
        return False

    if time() <= Challenge.inside.start:
        t0, t1 = Challenge.transition.start, Challenge.inside.start
        trans_progress = remap(t0, t1, 0, screen().w, time())
        dist = (pos - screen().mr).magnitude
        return dist <= trans_progress

    else:
        t0, t1 = Challenge.inside.end, Challenge.transition.end
        trans_progress = remap(t0, t1, 0, screen().w, time())
        dist = (pos - screen().ml).magnitude
        return dist >= trans_progress


def challenge_theme(pos: Vec2) -> int:
    return is_in_challenge(pos) and Challenge.theme_index


def note_speed_distance() -> float:
    return (X_LINE_DISAPPEAR - X_SPAWN) * remap(1, 10, 0.45, 0.20, Options.note_speed)


def floor_to_x(point_floor_position: float, canvas_floor_position: float) -> float:
    remaining = point_floor_position - canvas_floor_position
    progress = remaining / note_speed_distance()
    x = lerp(X_JUDGE, X_SPAWN, progress)
    return camera_scale_x(x, camera.scale)


def get_visual_start_time(floor_position: float, first_speed: CanvasSpeed) -> float:
    target_max = floor_position
    target_min = floor_position - note_speed_distance()

    speed_idx = first_speed.index

    while True:
        speed = first_speed.at(speed_idx, check=False)

        # check if it's already visible, else check if it will become visible
        if target_min <= speed.floor_position <= target_max:
            return speed.time

        elif speed.is_last_point:
            if speed.value >= 0 and speed.floor_position < target_min:
                return speed.time + (target_min - speed.floor_position) / speed.value
            elif speed.value < 0 and speed.floor_position > target_max:
                return speed.time + (target_max - speed.floor_position) / speed.value
            notify("Could not find visual start time")
            return -2

        else:
            seg_min = min(speed.floor_position, speed.next.floor_position)
            seg_max = max(speed.floor_position, speed.next.floor_position)

            if (max(target_min, seg_min) <= min(target_max, seg_max)) or (
                # sometimes there are points before the first speed point
                speed.is_first_point
                and (
                    (speed.floor_position >= target_min)
                    if speed.value >= 0
                    else (speed.floor_position <= target_max)
                )
            ):
                # if speed.value < 0, it first appears at X_JUDGE
                return (
                    speed.time
                    + (
                        (target_min if speed.value >= 0 else target_max)
                        - speed.floor_position
                    )
                    / speed.value
                )

        speed_idx = speed.next.index


def get_visual_end_time(floor_position: float, last_speed: CanvasSpeed) -> float:
    target_min = floor_position - note_speed_distance()
    target_max = floor_position

    speed_idx = last_speed.index

    while True:
        speed = last_speed.at(speed_idx, check=False)

        if speed.is_last_point:
            if speed.value >= 0 and speed.floor_position <= target_max:
                return speed.time + (target_max - speed.floor_position) / speed.value
            elif speed.value < 0 and speed.floor_position >= target_min:
                return speed.time + (target_min - speed.floor_position) / speed.value

        else:
            if target_min <= speed.next.floor_position <= target_max:
                return speed.next.time

            seg_min = min(speed.floor_position, speed.next.floor_position)
            seg_max = max(speed.floor_position, speed.next.floor_position)

            if (max(target_min, seg_min) <= min(target_max, seg_max)) or (
                speed.is_first_point
                and (
                    (speed.floor_position >= target_min)
                    if speed.value >= 0
                    else (speed.floor_position <= target_max)
                )
            ):
                # if speed.value > 0, it passed x_judge normally, else passed x_spawn backward
                return (
                    speed.time
                    + (
                        (target_max if speed.value >= 0 else target_min)
                        - speed.floor_position
                    )
                    / speed.value
                )

        if speed.is_first_point:
            notify("Could not find visual find end time")
            return -2.0

        speed_idx = speed.previous.index
