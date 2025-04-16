import { CameraMove } from './cameraEvents/CameraMove.js'
import { CanvasMove } from './canvasEvents/CanvasMove.js'
import { CanvasSpeed } from './canvasEvents/CanvasSpeed.js'
import { Initialization } from './Initialization.js'
import { InputManager } from './InputManager.js'
import { LinePoint } from './LinePoint.js'
import { CatchNote } from './notes/CatchNote.js'
import { HoldNote } from './notes/HoldNote.js'
import { TapNote } from './notes/TapNote.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
  Initialization,
  Stage,
  LinePoint,
  CanvasMove,
  CanvasSpeed,
  InputManager,
  TapNote,
  CatchNote,
  HoldNote,
  CameraMove
})
