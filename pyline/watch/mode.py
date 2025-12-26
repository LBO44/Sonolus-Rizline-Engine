from sonolus.script.engine import WatchMode

from pyline.lib.buckets import Buckets
from pyline.lib.effect import Effects
from pyline.lib.particle import Particles
from pyline.lib.skin import Skin
from pyline.watch.ease_events import EASE_EVENT_ARCHETYPES, Canvas
from pyline.watch.line import JudgeRingColor, Line, LineColor, LinePoint
from pyline.watch.note import NOTES_ARCHETYPES
from pyline.watch.stage import ChallengeTime, Stage
from pyline.watch.update_spawn import update_spawn

watch_mode = WatchMode(
    archetypes=[
        Stage,
        ChallengeTime,
        Line,
        LinePoint,
        JudgeRingColor,
        LineColor,
        *NOTES_ARCHETYPES,
        Canvas,
        *EASE_EVENT_ARCHETYPES,
    ],
    skin=Skin,
    effects=Effects,
    particles=Particles,
    buckets=Buckets,
    update_spawn=update_spawn,
)
