from sonolus.script.globals import level_memory
from sonolus.script.quad import Rect
from sonolus.script.runtime import screen, time
from sonolus.script.vec import Vec2

from pyline.lib.layout import X_JUDGE, X_NOTE_DISAPPEAR
from pyline.lib.line import JUDGE_RING_RADIUS
from pyline.lib.options import Options
from pyline.lib.skin import Skin
from pyline.tutorial.phases import PHASES


@level_memory
class TutorialState:
    current_phase: int
    previous_time: float


def inc_phase():
    TutorialState.current_phase += 1
    TutorialState.current_phase %= len(PHASES)
    TutorialState.previous_time = time()


def dec_phase():
    TutorialState.current_phase -= 1
    TutorialState.current_phase %= len(PHASES)
    TutorialState.previous_time = time()


def run_current_phase():
    for i, phase in enumerate(PHASES):
        if i == TutorialState.current_phase:
            is_done = phase(time() - TutorialState.previous_time)
            if is_done:
                inc_phase()
            return


def update():
    Skin.background[0].draw(screen())
    fade_layout = Rect.from_margin(screen().t, screen().t / 2)
    Skin.background_fade_judge[0].draw(
        fade_layout.translate(Vec2(X_NOTE_DISAPPEAR - 0.05, 0)),
        45,
        1.5,
    )
    ring_layout = Rect.from_margin(JUDGE_RING_RADIUS * Options.note_size).translate(
        Vec2(X_JUDGE, 0)
    )
    Skin.judge_rings[0].draw(ring_layout, 5)

    run_current_phase()
