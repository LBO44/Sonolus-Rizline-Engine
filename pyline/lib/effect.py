from sonolus.script.effect import StandardEffect, effects


@effects
class Effects:
    tap: StandardEffect.PERFECT  # tap and hold start notes
    drag: StandardEffect.GREAT  # drag notes
