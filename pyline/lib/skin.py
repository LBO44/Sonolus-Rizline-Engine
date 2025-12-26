from typing import Any

from sonolus.script.sprite import (
    RenderMode,
    Sprite,
    SpriteGroup,
    skin,
    sprite,
    sprite_group,
)


def varied_sprites(name: str) -> Any:
    return sprite_group([f"{name} {v}" for v in ["Normal", "Challenge"]])


@skin
class Skin:
    render_mode: RenderMode = RenderMode.LIGHTWEIGHT
    # Drawing order: background < lines < hold connectors < notes < judge rings

    # background
    background: SpriteGroup = varied_sprites("Background")

    background_circle_normal: Sprite = sprite("Background Circle Normal")
    background_circle_challenge: Sprite = sprite("Background Circle Challenge")

    background_fade_spawn: SpriteGroup = varied_sprites("Fade Out Spawn")
    background_fade_judge: SpriteGroup = varied_sprites("Fade Out Judge")

    # note
    note_drag: Sprite = sprite("Drag Note")
    note_hold: Sprite = sprite("Hold Note")

    note_tap: SpriteGroup = varied_sprites("Tap Note")
    note_hold_head_decorator: Sprite = sprite("Hold Head Decorator")
    note_hold_connector: SpriteGroup = varied_sprites("Hold Connector")
    note_hold_tail: SpriteGroup = varied_sprites("Hold Connector Fade Out")
    miss_effect: Sprite = sprite("Miss Effect Overlay")
    miss_cross: Sprite = sprite("Miss Effect Cross")

    lines: SpriteGroup = sprite_group([f"Line Color {i}" for i in range(32)])
    judge_rings: SpriteGroup = sprite_group(
        [f"Judge Ring Color {i}" for i in range(32)]
    )

    # drawn on top of colored sprites to simulate transparency
    judge_ring_background: SpriteGroup = varied_sprites("Judge Ring Background")
    # background and line background sprites are actually the same
    line_background: SpriteGroup = varied_sprites("Line Background")
