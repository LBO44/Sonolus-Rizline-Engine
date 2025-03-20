import { CanvasMove } from './CanvasMove.js'
import { CanvasSpeed } from './CanvasSpeed.js'
import { Initialization } from './Initialization.js'
import { Line } from './Line.js'
import { LinePoint } from './LinePoint.js'
import { Note } from './Note.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
  Initialization,
  Stage,
  Line,
  LinePoint,
  Note,
  CanvasMove,
  CanvasSpeed
})
