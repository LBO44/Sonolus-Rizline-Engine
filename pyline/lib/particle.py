from typing import Any

from sonolus.script.particle import (
    Particle,
    ParticleGroup,
    particle,
    particle_group,
    particles,
)


def colored_particles(name: str) -> Any:
    return particle_group([f"{name} Color {v}" for v in range(10)])


@particles
class Particles:
    hit: ParticleGroup = colored_particles("Hit")
    hit_extension: ParticleGroup = colored_particles("Hit Extension")
    # every note gets particle, including hold end
    bad: Particle = particle("Bad")  # spawn on touch pos
