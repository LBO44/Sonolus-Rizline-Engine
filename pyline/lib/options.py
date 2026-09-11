from sonolus.script.options import (
    OptionCategory,
    options,
    select_option,
    slider_option,
    toggle_option,
)
from sonolus.script.text import StandardText


@options
class Options:
    gameplay = OptionCategory(StandardText.GAMEPLAY)
    graphics = OptionCategory(StandardText.GRAPHICS)
    audio = OptionCategory(StandardText.AUDIO)

    speed: float = slider_option(
        name=StandardText.SPEED,
        standard=True,
        default=1,
        min=0.5,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
        category=gameplay,
    )
    mirror: bool = toggle_option(
        name=StandardText.MIRROR,
        default=False,
        category=gameplay,
    )
    note_speed: float = slider_option(
        name=StandardText.NOTE_SPEED,
        default=3,
        min=1,
        max=10,
        step=0.1,
        scope="Rizline",
        category=gameplay,
    )
    note_size: float = slider_option(
        name=StandardText.NOTE_SIZE,
        default=1,
        min=0.1,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
        scope="Rizline",
        category=graphics,
    )
    particle: int = select_option(
        name="Note Effects Select",
        title=StandardText.NOTE_EFFECT,
        values=[StandardText.ALL, StandardText.PARTICLE, StandardText.NONE],
        default=StandardText.ALL,
        scope="Rizline",
        category=graphics,
    )
    particle_size: float = slider_option(
        name=StandardText.NOTE_EFFECT_SIZE,
        default=1,
        min=0.1,
        max=2,
        step=0.05,
        unit=StandardText.PERCENTAGE_UNIT,
        scope="Rizline",
        category=graphics,
    )
    sfx: bool = toggle_option(
        name=StandardText.EFFECT,
        default=True,
        scope="Rizline",
        category=audio,
    )
    auto_sfx: bool = toggle_option(
        name=StandardText.EFFECT_AUTO,
        default=False,
        scope="Rizline",
        category=audio,
    )
    haptic: bool = toggle_option(
        name=StandardText.HAPTIC,
        default=False,
        scope="Rizline",
        category=gameplay,
    )
    colored_ui: bool = toggle_option(
        name="Colourful UI",
        title={
            "en": "Colourful UI",
            "fr": "Interface Colorée",
        },
        description={
            "en": "Use the level's colours for the UI menu and metric.",
            "fr": "Utiliser les couleurs du niveau pour l'interface et les métriques.",
        },
        default=True,
        scope="Rizline",
        category=graphics,
    )
    background_opacity: float = slider_option(
        name="Colour Background Opacity",
        title={
            "en": "Colour Background Opacity",
            "fr": "Opacité de l'Arrière-plan Coloré",
        },
        description={
            "en": "In case you wish to use a custom Sonolus background instead.\nWill slightly break transparent lines.",
            "fr": "Si vous souhaitez utiliser un autre arrière-plan Sonolus.\nAbîmera les lignes transparentes.",
        },
        unit=StandardText.PERCENTAGE_UNIT,
        min=0,
        max=1,
        step=0.1,
        default=1,
        scope="Rizline",
        category=graphics,
    )
