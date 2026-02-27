from typing import Any

from sonolus.script.particle import (
    Particle,
    ParticleGroup,
    particle,
    particle_group,
    particles,
)


def themed_particles(name: str) -> Any:
    return particle_group([f"{name} Theme {v}" for v in range(8)])


@particles
class Particles:
    hit: ParticleGroup = themed_particles("Hit")
    hit_extension: ParticleGroup = themed_particles("Hit Extension")
    # every note gets particle, including hold end
    bad: Particle = particle("Bad")  # spawn on touch pos
