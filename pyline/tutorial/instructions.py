from sonolus.script.instruction import (
    Instruction,
    StandardInstructionIcon,
    instruction,
    instruction_icons,
    instructions,
)


@instructions
class Instructions:
    tap: Instruction = instruction(
        {
            "en": "Tap Anywhere",
            "fr": "Tapez n'importe où",
        }
    )
    drag: Instruction = instruction(
        {
            "en": "Touch Anywhere",
            "fr": "Touchez n'importe où",
        }
    )
    hold: Instruction = instruction(
        {
            "en": "Tap and hold until the end, no need to release",
            "fr": "Tapez et maintenez jusqu'à la fin, pas besoin de relâcher au moment exact",
        }
    )


@instruction_icons
class InstructionIcons:
    hand: StandardInstructionIcon.HAND
