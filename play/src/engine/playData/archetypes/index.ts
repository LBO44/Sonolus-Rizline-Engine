import { CanvasMove } from './CanvasMove.js'
import { CanvasSpeed } from './CanvasSpeed.js'
import { Initialization } from './Initialization.js'
import { InputManager } from './InputManager.js'
import { Line } from './Line.js'
import { LinePoint } from './LinePoint.js'
import { CatchNote } from './notes/CatchNote.js'
import { TapNote } from './notes/TapNote.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
  Initialization,
  Stage,
  Line,
  LinePoint,
  CanvasMove,
  CanvasSpeed,
  InputManager,
  TapNote,
  CatchNote,
})
