from sonolus.script.engine import Engine, EngineData
from sonolus.script.project import Project

from pyline.lib.options import Options
from pyline.lib.ui import ui_config
from pyline.level import load_levels
from pyline.play.mode import play_mode
from pyline.preview.mode import preview_mode
from pyline.tutorial.mode import tutorial_mode
from pyline.watch.mode import watch_mode

engine = Engine(
    name="pyline",
    title="rizline.py",
    skin="pixel",
    particle="pixel",
    background="vanilla",
    effect="8bit",
    data=EngineData(
        ui=ui_config,
        options=Options,
        play=play_mode,
        watch=watch_mode,
        preview=preview_mode,
        tutorial=tutorial_mode,
    ),
)

project = Project(
    engine=engine,
    levels=load_levels,
)
