from typing import Any

from sonolus.script.sprite import (
    RenderMode,
    Sprite,
    SpriteGroup,
    skin,
    sprite,
    sprite_group,
)


def themed_sprites(name: str) -> Any:
    return sprite_group([f"{name} Theme {v}" for v in range(8)])


@skin
class Skin:
    render_mode: RenderMode = RenderMode.LIGHTWEIGHT
    # Drawing order: background < lines < hold connectors < notes < judge rings

    # backgrounds
    # also used as line background
    background: SpriteGroup = themed_sprites("Background")
    background_circle: SpriteGroup = themed_sprites("Background Circle")
    background_fade: SpriteGroup = themed_sprites("Fade Out")
    ui_backgrounds: SpriteGroup = themed_sprites("UI Background")

    # notes
    note_drag: Sprite = sprite("Drag Note")
    note_hold: Sprite = sprite("Hold Note")

    note_tap: SpriteGroup = themed_sprites("Tap Note")
    note_hold_head_decorator: Sprite = sprite("Hold Head Decorator")
    note_hold_connector: SpriteGroup = themed_sprites("Hold Connector")
    note_hold_tail: SpriteGroup = themed_sprites("Hold Connector Fade Out")
    miss_effect: Sprite = sprite("Miss Effect Overlay")
    miss_cross: Sprite = sprite("Miss Effect Cross")

    lines: SpriteGroup = sprite_group([f"Line Color {i}" for i in range(62)])
    judge_rings: SpriteGroup = sprite_group(
        [f"Judge Ring Color {i}" for i in range(32)]
    )

    # drawn on top of colored sprites to simulate transparency
    judge_ring_background: SpriteGroup = themed_sprites("Judge Ring Background")
