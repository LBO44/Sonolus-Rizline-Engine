from sonolus.script.archetype import PlayArchetype, entity_data, imported
from sonolus.script.debug import debug_log
from sonolus.script.interval import Interval
from sonolus.script.runtime import level_score, time
from sonolus.script.timing import beat_to_time

from pyline.lib.buckets import init_buckets
from pyline.lib.layout import Challenge, draw_background
from pyline.lib.note import ChartDifficulty, init_note_life
from pyline.lib.ui import init_ui
from pyline.play.input import refresh_input_state
from pyline.play.note import NOTES_ARCHETYPES


class Stage(PlayArchetype):
    name = "Stage"

    challenge_total_hit_count: int = imported(name="challengeTotalHitCount")
    difficulty: ChartDifficulty = imported()

    def preprocess(self):
        debug_log(0)
        init_ui()
        init_buckets()
        for note in NOTES_ARCHETYPES:
            if note.is_scored:  # skip note effects
                init_note_life(note, self.challenge_total_hit_count, self.difficulty)

        level_score().update(
            perfect_multiplier=1.0,
            great_multiplier=1.0,
            good_multiplier=0.5,
            consecutive_perfect_multiplier=1.0,
            consecutive_perfect_step=4,
            consecutive_perfect_cap=12,
            consecutive_great_multiplier=1.0,
            consecutive_great_step=4,
            consecutive_great_cap=12,
        )

    def spawn_order(self) -> float:
        return 0

    def should_spawn(self) -> bool:
        return True

    def update_parallel(self):
        draw_background()

    def update_sequential(self):
        refresh_input_state()


class ChallengeTime(PlayArchetype):
    name = "Challenge Time"

    start_beat: float = imported(name="startBeat")
    end_beat: float = imported(name="endBeat")
    transition_duration: float = imported(name="transitionDuration")

    challenge_transition: Interval = entity_data()
    challenge_in: Interval = entity_data()

    def preprocess(self):
        self.challenge_transition = Interval(
            beat_to_time(self.start_beat),
            beat_to_time(self.end_beat + self.transition_duration),
        )
        self.challenge_in = Interval(
            beat_to_time(self.start_beat + self.transition_duration),
            beat_to_time(self.end_beat),
        )

    def spawn_order(self) -> float:
        return self.challenge_transition.start

    def should_spawn(self) -> bool:
        return time() >= self.challenge_transition.start

    def update_sequential(self):
        self.despawn = True
        Challenge.transition = self.challenge_transition
        Challenge.inside = self.challenge_in
