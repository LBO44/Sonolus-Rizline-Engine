import { ChallengeEnd, ChallengeStart } from './ChallengeTimes.js'
import { CameraMove, CameraScale, CanvasMove } from './easeEvents.js'
import { Initialization } from './Initialization.js'
import { LinePoint } from './LinePoint.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
    Initialization,
    Stage,

    LinePoint,

    ChallengeStart,
    ChallengeEnd,

    CanvasMove,

    CameraMove,
    CameraScale,
})
