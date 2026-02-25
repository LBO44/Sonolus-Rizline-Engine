from enum import IntEnum

from sonolus.script.bucket import Bucket, JudgmentWindow, bucket, bucket_sprite, buckets
from sonolus.script.interval import Interval
from sonolus.script.sprite import Sprite
from sonolus.script.text import StandardText

from pyline.lib.skin import Skin


class ChartDifficulty(IntEnum):
    EZ = 0
    HD = 1
    IN = 2  # AT and IN have same


def get_simple_bucket(sprite: Sprite) -> Bucket:
    return bucket(
        sprites=[bucket_sprite(sprite=sprite, x=0, y=0, w=1.5, h=1.5)],
        unit=StandardText.MILLISECOND_UNIT,
    )


def get_hold_start_bucket(sprite: Sprite) -> Bucket:
    return bucket(
        sprites=[
            bucket_sprite(sprite=Skin.note_hold, x=0, y=0, w=2, h=2),
            bucket_sprite(sprite=sprite, x=-1, y=0, w=1, h=2),
            bucket_sprite(sprite=Skin.note_hold_head_decorator, x=0, y=0, w=2, h=2),
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )


def get_hold_end_bucket(sprite: Sprite) -> Bucket:
    return bucket(
        sprites=[
            bucket_sprite(sprite=sprite, x=-1, y=0, w=1, h=2),
            bucket_sprite(sprite=Skin.note_hold_head_decorator, x=0, y=0, w=2, h=2),
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )


@buckets
class Buckets:
    normal_tap: Bucket = get_simple_bucket(Skin.note_tap[0])
    normal_hold_start: Bucket = get_hold_start_bucket(Skin.note_hold_connector[0])
    normal_hold_end: Bucket = get_hold_end_bucket(Skin.note_hold_tail[0])
    normal_drag: Bucket = get_simple_bucket(Skin.note_drag)

    challenge_tap: Bucket = get_simple_bucket(Skin.note_tap[1])
    challenge_hold_start: Bucket = get_hold_start_bucket(Skin.note_hold_connector[1])
    challenge_hold_end: Bucket = get_hold_end_bucket(Skin.note_hold_tail[1])
    challenge_drag: Bucket = get_simple_bucket(Skin.note_drag)


WINDOW_SCALE = 1000  # windows are in ms


# from rizwiki.cn:

# non challenge/riztime notes only have Hit/Bad/Miss
# bad: bad will spawn a bad particle, but it's still possible to hit the note afterward
NORMAL_WINDOWS: dict[ChartDifficulty, JudgmentWindow] = {
    ChartDifficulty.EZ: JudgmentWindow(
        perfect=Interval(-0.140, 0.140),
        great=Interval(-0.140, 0.140),
        good=Interval(-0.200, 0.140),
    ),
    ChartDifficulty.HD: JudgmentWindow(
        perfect=Interval(-0.115, 0.115),
        great=Interval(-0.115, 0.115),
        good=Interval(-0.170, 0.115),
    ),
    ChartDifficulty.IN: JudgmentWindow(
        perfect=Interval(-0.090, 0.090),
        great=Interval(-0.090, 0.090),
        good=Interval(-0.125, 0.090),
    ),
}

# has different timings + early/late
CHALLENGE_WINDOWS: dict[ChartDifficulty, JudgmentWindow] = {
    ChartDifficulty.EZ: JudgmentWindow(
        perfect=Interval(-0.070, 0.070),
        great=Interval(-0.180, 0.840),
        good=Interval(-0.200, 0.180),
    ),
    ChartDifficulty.HD: JudgmentWindow(
        perfect=Interval(-0.060, 0.060),
        great=Interval(-0.145, 0.145),
        good=Interval(-0.170, 0.145),
    ),
    ChartDifficulty.IN: JudgmentWindow(
        perfect=Interval(-0.050, 0.050),
        great=Interval(-0.110, 0.110),
        good=Interval(-0.125, 0.110),
    ),
}


def get_window(challenge: bool, diff: ChartDifficulty) -> JudgmentWindow:
    window = +JudgmentWindow
    match diff, challenge:
        case ChartDifficulty.EZ, 1:
            window @= CHALLENGE_WINDOWS[ChartDifficulty.EZ]
        case ChartDifficulty.HD, 1:
            window @= CHALLENGE_WINDOWS[ChartDifficulty.HD]
        case ChartDifficulty.IN, 1:
            window @= CHALLENGE_WINDOWS[ChartDifficulty.IN]
        case ChartDifficulty.EZ, 0:
            window @= NORMAL_WINDOWS[ChartDifficulty.EZ]
        case ChartDifficulty.HD, 0:
            window @= NORMAL_WINDOWS[ChartDifficulty.HD]
        case ChartDifficulty.IN, 0:
            window @= NORMAL_WINDOWS[ChartDifficulty.IN]
    return window


# Tap Note and Hold start
def get_tap_window(diff: ChartDifficulty, challenge: bool = False) -> JudgmentWindow:
    return get_window(challenge, diff)


# Can be early but can't be Late as you don't need to release
def get_hold_end_window(
    diff: ChartDifficulty, challenge: bool = False
) -> JudgmentWindow:
    window = get_window(challenge, diff)
    return JudgmentWindow(
        perfect=Interval(window.perfect.start, 0),
        great=Interval(window.great.start, 0),  # Hold End can be Early
        good=Interval(window.great.start, 0),  # Hold End can't be Bad apparently
    )


# Can only be perfect or miss
def get_drag_window(diff: ChartDifficulty, challenge: bool = False) -> JudgmentWindow:
    window = get_window(challenge, diff)
    return JudgmentWindow(
        perfect=window.perfect,
        great=window.perfect,
        good=window.perfect,
    )


def init_buckets(diff: ChartDifficulty):
    Buckets.normal_tap.window @= get_tap_window(diff) * WINDOW_SCALE
    Buckets.normal_hold_start.window @= get_tap_window(diff) * WINDOW_SCALE
    Buckets.normal_hold_end.window @= get_hold_end_window(diff) * WINDOW_SCALE
    Buckets.normal_drag.window @= get_drag_window(diff) * WINDOW_SCALE

    Buckets.challenge_tap.window @= get_tap_window(diff, True) * WINDOW_SCALE
    Buckets.challenge_hold_start.window @= get_tap_window(diff, True) * WINDOW_SCALE
    Buckets.challenge_hold_end.window @= get_hold_end_window(diff, True) * WINDOW_SCALE
    Buckets.challenge_drag.window @= get_drag_window(diff, True) * WINDOW_SCALE
