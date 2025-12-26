from sonolus.script.bucket import Bucket, JudgmentWindow, bucket, bucket_sprite, buckets
from sonolus.script.interval import Interval
from sonolus.script.text import StandardText

from pyline.lib.skin import Skin


@buckets
class Buckets:
    tap: Bucket = bucket(
        sprites=[
            bucket_sprite(
                sprite=Skin.note_tap[0],
                x=-2,
                y=0,
                w=2,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_tap[1],
                x=2,
                y=0,
                w=2,
                h=2,
            ),
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )

    hold_start: Bucket = bucket(
        sprites=[
            bucket_sprite(
                sprite=Skin.note_hold,
                x=-2,
                y=0,
                w=2,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_connector[0],
                x=-3,
                y=0,
                w=1,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_head_decorator,
                x=-2,
                y=0,
                w=2,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold,
                x=2,
                y=0,
                w=2,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_connector[1],
                x=1,
                y=0,
                w=1,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_head_decorator,
                x=2,
                y=0,
                w=2,
                h=2,
            ),
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )

    hold_end: Bucket = bucket(
        sprites=[
            bucket_sprite(
                sprite=Skin.note_hold_tail[0],
                x=-2.25,
                y=0,
                w=1,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_head_decorator,
                x=-1.25,
                y=0,
                w=2,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_tail[1],
                x=1.25,
                y=0,
                w=1,
                h=2,
            ),
            bucket_sprite(
                sprite=Skin.note_hold_head_decorator,
                x=2.25,
                y=0,
                w=2,
                h=2,
            ),
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )

    drag: Bucket = bucket(
        sprites=[
            bucket_sprite(
                sprite=Skin.note_drag,
                x=0,
                y=0,
                w=1.5,
                h=1.5,
            )
        ],
        unit=StandardText.MILLISECOND_UNIT,
    )


WINDOW_SCALE = 1000  # windows are in ms


# from rizwiki.cn
TAP_WINDOW = JudgmentWindow(
    # Tap Note and Hold start
    perfect=Interval(-0.045, 0.045),  # perfect
    great=Interval(-0.09, 0.09),  # early/late
    good=Interval(-0.095, 0.09),
    # bad: bad will spawn a bad particle, but it's still possible to hit the note afterward
)

HOLD_END_WINDOW = JudgmentWindow(
    # Can be early but can't be Late as you don't need to release
    perfect=Interval(-0.045, 0),
    great=Interval(-0.09, 0),
    good=Interval(-0.09, 0),  # Hold End can't be bad
)

DRAG_WINDOW = JudgmentWindow(
    # Can only be perfect or miss
    perfect=Interval(-0.045, 0.045),
    great=Interval(-0.045, 0.045),
    good=Interval(-0.045, 0.045),
)


def init_buckets():
    Buckets.drag.window @= DRAG_WINDOW * WINDOW_SCALE
    Buckets.tap.window @= TAP_WINDOW * WINDOW_SCALE
    Buckets.hold_start.window @= TAP_WINDOW * WINDOW_SCALE
    Buckets.hold_end.window @= HOLD_END_WINDOW * WINDOW_SCALE
