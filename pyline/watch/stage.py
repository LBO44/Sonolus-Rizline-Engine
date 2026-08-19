from sonolus.script.archetype import (
    WatchArchetype,
    entity_data,
    imported,
)
from sonolus.script.debug import debug_log
from sonolus.script.interval import Interval
from sonolus.script.runtime import level_score
from sonolus.script.timing import beat_to_time

from pyline.lib.buckets import ChartDifficulty, init_buckets
from pyline.lib.layout import Challenge, draw_background, draw_ui
from pyline.lib.note import ChartStats, init_note_archetype_life
from pyline.lib.streams import Streams
from pyline.lib.ui import init_ui
from pyline.watch.note import NOTES_ARCHETYPES, NoteBadParticleSchedule


class Stage(WatchArchetype):
    name = "Stage"

    challenge_total_hit_count: int = imported(name="challengeTotalHitCount")
    max_rizline_combo: int = imported(name="rizlineMaxCombo")
    difficulty: ChartDifficulty = imported()

    def preprocess(self):
        debug_log(0)
        init_ui()
        init_buckets(self.difficulty)
        for note in NOTES_ARCHETYPES:
            if note.is_scored:  # skip note effects
                init_note_archetype_life(note, self.difficulty)
        level_score().update(
            perfect_multiplier=1.0,
            great_multiplier=0.8,
            good_multiplier=0.5,
            consecutive_perfect_multiplier=1.0,
            consecutive_perfect_step=4,
            consecutive_perfect_cap=12,
            consecutive_great_multiplier=1.0,
            consecutive_great_step=4,
            consecutive_great_cap=12,
        )

        ChartStats.challenge_hit_count = self.challenge_total_hit_count
        ChartStats.challenge_score_multiplier = self.max_rizline_combo / (
            5 * self.challenge_total_hit_count
        )
        ChartStats.difficulty = self.difficulty

        for time, pos in Streams.bad_effects.iter_items_from(0):
            NoteBadParticleSchedule.spawn(start_time=time, pos=pos)

    def spawn_time(self) -> float:
        return -1e8

    def despawn_time(self) -> float:
        return 1e8

    def update_parallel(self):
        draw_background()
        draw_ui()


class ChallengeTime(WatchArchetype):
    name = "Challenge Time"

    start_beat: float = imported(name="startBeat")
    end_beat: float = imported(name="endBeat")
    transition_duration: float = imported(name="transitionDuration")

    color_index_particle: int = imported(name="colorIndexParticle")
    color_index_pixel: int = imported(name="colorIndexBackgroundPixel")
    color_index_background_element: int = imported(name="colorIndexBackgroundElement")
    color_index_ui: int = imported(name="colorIndexUI")
    color_index_note: int = imported(name="colorIndexNote")
    color_index_judge_ring: int = imported(name="colorIndexBackgroundJudgeRing")

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

    def spawn_time(self) -> float:
        return self.challenge_transition.start

    def despawn_time(self) -> float:
        return self.challenge_transition.end

    def update_sequential(self):
        Challenge.transition = self.challenge_transition
        Challenge.inside = self.challenge_in

        Challenge.color_index_particle = self.color_index_particle
        Challenge.color_index_pixel = self.color_index_pixel
        Challenge.color_index_background_element = self.color_index_background_element
        Challenge.color_index_ui = self.color_index_ui
        Challenge.color_index_note = self.color_index_note
        Challenge.color_index_judge_ring = self.color_index_judge_ring
