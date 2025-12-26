from sonolus.script.particle import Particle, particle, particles


@particles
class Particles:
    normal: Particle = particle("Hit Normal")
    challenge: Particle = particle("Hit Challenge")
    challenge_extended: Particle = particle("Hit Challenge Extension")
    # every note gets particle, including hold end
    bad: Particle = particle("Bad")  # spawn on touch pos
