from sonolus.script.engine import TutorialMode

from pyline.lib.effect import Effects
from pyline.lib.particle import Particles
from pyline.lib.skin import Skin
from pyline.tutorial.instructions import InstructionIcons, Instructions
from pyline.tutorial.navigate import navigate
from pyline.tutorial.preprocess import preprocess
from pyline.tutorial.update import update

tutorial_mode = TutorialMode(
    skin=Skin,
    effects=Effects,
    particles=Particles,
    instructions=Instructions,
    instruction_icons=InstructionIcons,
    preprocess=preprocess,
    navigate=navigate,
    update=update,
)
