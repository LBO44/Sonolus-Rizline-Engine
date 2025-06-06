import { Initialization } from './Initialization.js'
import { InputManager } from './InputManager.js'
import { Stage } from './Stage.js'

import { ChallengeEnd, ChallengeStart } from './ChallengeTimes.js'
import { CameraMove } from './easeEvents/CameraMove.js'
import { CanvasMove } from './easeEvents/CanvasMove.js'
import { CanvasSpeed } from './easeEvents/CanvasSpeed.js'

import { JudgeRingColorKeyPoint } from './JudgeRingColorKeyPoint.js'
import { Line } from './Line.js'
import { LineColorKeyPoint } from './LineColorKeyPoint.js'
import { LinePoint } from './LinePoint.js'

import { DragNote } from './notes/DragNote.js'
import { HoldEndNote } from './notes/HoldEndNote.js'
import { HoldNote } from './notes/HoldNote.js'
import { TapNote } from './notes/TapNote.js'

import { MissEffect } from './missEffect.js'

export const archetypes = defineArchetypes({
  Initialization,
  Stage,
  InputManager,

  LinePoint,
  Line,
  LineColorKeyPoint,
  JudgeRingColorKeyPoint,

  CanvasMove,
  CanvasSpeed,
  CameraMove,

  ChallengeStart,
  ChallengeEnd,

  TapNote,
  DragNote,
  HoldNote,
  HoldEndNote,

  MissEffect,
})
