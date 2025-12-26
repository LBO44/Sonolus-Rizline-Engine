LAYER_BACKGROUND = 1
LAYER_BACKGROUND_OVER = 2

LAYER_BACKGROUND_FADE_SPAWN = 15
LAYER_BACKGROUND_FADE_JUDGE = 9

LAYER_JUDGE_RING = 20
LAYER_LINE = 5
# don't want to draw background line on top of non transparent lines
LAYER_LINE_GLOBAL = 3

LAYER_NOTE = 11
LAYER_HOLD_NOTE = 10
LAYER_HOLD_NOTE_MISS_EFFECT = 8
LAYER_MISS_EFFECT = 12


def z_offset(index: float, local_offset: float = 0) -> float:
    return index / 12800 + local_offset / 25600
