from sonolus.script.engine import PlayMode

from pyline.lib.buckets import Buckets
from pyline.lib.effect import Effects
from pyline.lib.particle import Particles
from pyline.lib.skin import Skin
from pyline.play.ease_events import EASE_EVENT_ARCHETYPES, Canvas
from pyline.play.line import JudgeRingColor, Line, LineColor, LinePoint
from pyline.play.note import NOTES_ARCHETYPES
from pyline.play.stage import ChallengeTime, Stage

play_mode = PlayMode(
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
)
