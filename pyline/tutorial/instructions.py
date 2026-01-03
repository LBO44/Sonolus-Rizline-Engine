from sonolus.script.instruction import (
    Instruction,
    StandardInstructionIcon,
    instruction,
    instruction_icons,
    instructions,
)


@instructions
class Instructions:
    tap: Instruction = instruction("Tap Anywhere")
    drag: Instruction = instruction("Touch Anywhere")
    hold: Instruction = instruction(
        "Tap and hold until the end. You don't need to release."
    )


@instruction_icons
class InstructionIcons:
    hand: StandardInstructionIcon.HAND
