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


class NoteKind(IntEnum):
    TAP = 0
    DRAG = 1
    HOLD_START = 2
    HOLD_END = 3


NORMAL = False
CHALLENGE = True
NOTE_TYPES = (NORMAL, CHALLENGE)


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


BUCKETS: dict[tuple[bool, NoteKind], Bucket] = {
    (t, k): getattr(Buckets, f"{'challenge' if t else 'normal'}_{k.name.lower()}")
    for k in NoteKind
    for t in NOTE_TYPES
}


# from rizwiki.cn:
# bad: bad will spawn a bad particle, but it's still possible to hit the note afterward

WINDOWS: dict[tuple[bool, ChartDifficulty], JudgmentWindow] = {
    # normal/not challenge notes only have Hit/Bad/Miss
    (False, ChartDifficulty.EZ): JudgmentWindow(
        perfect=Interval(-0.140, 0.140),
        great=Interval(-0.140, 0.140),
        good=Interval(-0.200, 0.140),
    ),
    (False, ChartDifficulty.HD): JudgmentWindow(
        perfect=Interval(-0.115, 0.115),
        great=Interval(-0.115, 0.115),
        good=Interval(-0.170, 0.115),
    ),
    (False, ChartDifficulty.IN): JudgmentWindow(
        perfect=Interval(-0.090, 0.090),
        great=Interval(-0.090, 0.090),
        good=Interval(-0.125, 0.090),
    ),
    # Challenge: has different timings + early/late
    (True, ChartDifficulty.EZ): JudgmentWindow(
        perfect=Interval(-0.070, 0.070),
        great=Interval(-0.180, 0.840),
        good=Interval(-0.200, 0.180),
    ),
    (True, ChartDifficulty.HD): JudgmentWindow(
        perfect=Interval(-0.060, 0.060),
        great=Interval(-0.145, 0.145),
        good=Interval(-0.170, 0.145),
    ),
    (True, ChartDifficulty.IN): JudgmentWindow(
        perfect=Interval(-0.050, 0.050),
        great=Interval(-0.110, 0.110),
        good=Interval(-0.125, 0.110),
    ),
}
WINDOW_SCALE = 1000  # windows are in ms


def get_window(
    diff: ChartDifficulty, is_challenge: bool, kind: NoteKind
) -> JudgmentWindow:
    base = WINDOWS[(is_challenge, diff)]
    window = +JudgmentWindow
    match kind:
        case NoteKind.TAP | NoteKind.HOLD_START:
            window @= base
        case NoteKind.DRAG:
            # Can only be perfect or miss
            window @= JudgmentWindow(
                perfect=base.perfect, great=base.perfect, good=base.perfect
            )
        case NoteKind.HOLD_END:
            # Can be early but can't be Late as you don't need to release
            # Can be Early only during riztime, can never be Bad
            window @= JudgmentWindow(
                perfect=Interval(
                    base.perfect.start if is_challenge else base.good.start, 0
                ),
                great=Interval(base.good.start, 0),  # use bad window for early?
                good=Interval(base.good.start, 0),
            )
    return window


def init_buckets(diff: ChartDifficulty):
    for t in NOTE_TYPES:
        for k in NoteKind:
            BUCKETS[t, k].window @= get_window(diff, t, k) * WINDOW_SCALE
