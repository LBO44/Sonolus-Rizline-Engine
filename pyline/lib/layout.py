from sonolus.script.globals import level_memory
from sonolus.script.interval import Interval, lerp, remap
from sonolus.script.quad import Rect
from sonolus.script.runtime import is_tutorial, screen, time
from sonolus.script.sprite import Sprite
from sonolus.script.vec import Vec2

from pyline.lib.ease import CanvasSpeed
from pyline.lib.layer import (
    LAYER_BACKGROUND,
    LAYER_BACKGROUND_FADE_JUDGE,
    LAYER_BACKGROUND_FADE_SPAWN,
    LAYER_BACKGROUND_OVER,
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


def draw_background() -> None:
    """draw the coloured background with transition animations"""

    if Options.disable_background:
        return

    fade_layout = Rect.from_margin(screen().t, screen().t / 2)
    challenge = -1

    if i := time() in Challenge.inside:
        challenge = True

    if o := time() not in Challenge.transition:
        challenge = False

    if o or i:
        Skin.background[challenge].draw(screen(), LAYER_BACKGROUND, 1)
        Skin.background_fade_spawn[challenge].draw(
            fade_layout.translate(Vec2(X_SPAWN + 0.1, 0)),
            LAYER_BACKGROUND_FADE_SPAWN,
            1.5,
        )
        Skin.background_fade_judge[challenge].draw(
            fade_layout.translate(Vec2(X_NOTE_DISAPPEAR - 0.05, 0)),
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
        over @= Skin.background_circle_challenge
        t0, t1 = Challenge.transition.start, Challenge.inside.start
        trans_progress = remap(t0, t1, 0, screen().w, time())
        trans_rect @= Rect.from_margin(trans_progress).translate(screen().mr)

    # challenge end transition animation
    else:
        under @= Skin.background[1]
        over @= Skin.background_circle_normal
        t0, t1 = Challenge.inside.end, Challenge.transition.end
        trans_progress = remap(t0, t1, 0, screen().w, time())
        trans_rect @= Rect.from_margin(trans_progress).translate(screen().ml)

    under.draw(screen(), LAYER_BACKGROUND, 1)
    over.draw(trans_rect, LAYER_BACKGROUND_OVER, 1)


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


def note_speed_distance() -> float:
    return (X_LINE_DISAPPEAR - X_SPAWN) * remap(1, 10, 0.45, 0.20, Options.note_speed)


def floor_to_x(point_floor_position: float, canvas_floor_position: float) -> float:
    remaining = point_floor_position - canvas_floor_position
    progress = remaining / note_speed_distance()
    return lerp(X_JUDGE, X_SPAWN, progress)


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

        else:
            seg_min = min(speed.floor_position, speed.next.floor_position)
            seg_max = max(speed.floor_position, speed.next.floor_position)

            if max(target_min, seg_min) <= min(target_max, seg_max):
                # if speed.value < 0, it first appears at X_JUDGE
                return (
                    speed.time
                    + (
                        (target_min if speed.value >= 0 else target_max)
                        - speed.floor_position
                    )
                    / speed.value
                )

        if speed.is_last_point:
            # notify("Could not find visual start time")
            return -2

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

            if max(target_min, seg_min) <= min(target_max, seg_max):
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
            # notify("Could not find visual find end time")
            return -2.0

        speed_idx = speed.previous.index
