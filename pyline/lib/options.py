from sonolus.script.options import options, slider_option, toggle_option
from sonolus.script.text import StandardText


@options
class Options:
    speed: float = slider_option(
        name=StandardText.SPEED,
        standard=True,
        default=1,
        min=0.5,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
    )
    mirror: bool = toggle_option(
        name=StandardText.MIRROR,
        default=False,
    )
    note_speed: float = slider_option(
        name=StandardText.NOTE_SPEED,
        default=3,
        min=1,
        max=10,
        step=0.1,
        scope="Rizline",
    )
    note_size: float = slider_option(
        name=StandardText.NOTE_SIZE,
        default=1,
        min=0.1,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
        scope="Rizline",
    )
    particle: bool = toggle_option(
        name=StandardText.NOTE_EFFECT,
        default=True,
        scope="Rizline",
    )
    particle_size: float = slider_option(
        name=StandardText.NOTE_EFFECT_SIZE,
        default=1,
        min=0.1,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
        scope="Rizline",
    )
    sfx: bool = toggle_option(
        name=StandardText.EFFECT,
        default=True,
        scope="Rizline",
    )
    auto_sfx: bool = toggle_option(
        name=StandardText.EFFECT_AUTO,
        default=False,
        scope="Rizline",
    )
    haptic: bool = toggle_option(
        name=StandardText.HAPTIC,
        default=False,
        scope="Rizline",
    )
    colored_ui: bool = toggle_option(
        name="Colourful UI",
        description="Use the level's colours for the UI menu and metric.",
        default=True,
        scope="Rizline",
    )
    background_opacity: float = slider_option(
        name="Colour Background Opacity",
        description="In case you wish to use a custom Sonolus background instead.\nWill slightly break transparent lines.",
        unit=StandardText.PERCENTAGE_UNIT,
        min=0,
        max=1,
        step=0.1,
        default=1,
        scope="Rizline",
    )
