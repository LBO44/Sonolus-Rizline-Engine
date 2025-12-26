from sonolus.script.stream import Stream, streams
from sonolus.script.vec import Vec2


@streams
class Streams:
    bad_effects: Stream[Vec2]
