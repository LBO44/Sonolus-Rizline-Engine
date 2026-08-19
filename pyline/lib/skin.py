from typing import Any

from sonolus.script.sprite import (
    RenderMode,
    Sprite,
    SpriteGroup,
    skin,
    sprite,
    sprite_group,
)


def colored_sprites(name: str, count: int) -> Any:
    return sprite_group(f"{name} Color {v}" for v in range(count))


@skin
class Skin:
    render_mode: RenderMode = RenderMode.LIGHTWEIGHT
    # Drawing order: background < lines < hold connectors < notes < judge rings

    background_half_disc: SpriteGroup = colored_sprites("Background Half Disc", 18)
    background_fade: SpriteGroup = colored_sprites("Fade Out", 18)

    # notes
    note_drag: Sprite = sprite("Drag Note")
    note_hold: Sprite = sprite("Hold Note")

    note_tap: SpriteGroup = colored_sprites("Tap Note", 18)
    note_hold_head_decorator: Sprite = sprite("Hold Head Decorator")
    note_hold_connector: SpriteGroup = colored_sprites("Hold Connector", 18)
    note_hold_tail: SpriteGroup = colored_sprites("Hold Connector Fade Out", 18)
    miss_effect: Sprite = sprite("Miss Effect Overlay")
    miss_cross: Sprite = sprite("Miss Effect Cross")

    line_discs: SpriteGroup = colored_sprites("Line Disc", 64)
    pixel: SpriteGroup = colored_sprites("Pixel", 64)
    """Pixel is used for lines, background, ui"""

    judge_rings: SpriteGroup = colored_sprites("Judge Ring", 32)
