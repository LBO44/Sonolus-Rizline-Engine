import { Initialization } from "./Initialization.js"
import { InputManager } from "./InputManager.js"
import { Stage } from "./Stage.js"

import { ChallengeEnd, ChallengeStart } from "./ChallengeTimes.js"
import { CameraMove } from "./easeEvents/CameraMove.js"
import { CanvasMove } from "./easeEvents/CanvasMove.js"
import { CanvasSpeed } from "./easeEvents/CanvasSpeed.js"

import { JudgeRingColorKeyPoint, LineColorKeyPoint } from "./ColorKeyPoint.js"
import { Line } from "./Line.js"
import { LinePoint } from "./LinePoint.js"

import { MissEffect } from "./missEffect.js"
import { ChallengeHoldEndNote, NormalHoldEndNote } from "./notes/HoldEndNote.js"
import { ChallengeDragNote, NormalDragNote } from "./notes/single/DragNote.js"
import { ChallengeHoldNote, NormalHoldNote } from "./notes/single/tappable/HoldStartNote.js"
import { ChallengeTapNote, NormalTapNote } from "./notes/single/tappable/TapNote.js"

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

  ChallengeTapNote,
  NormalTapNote,
  ChallengeDragNote,
  NormalDragNote,
  ChallengeHoldNote,
  NormalHoldNote,
  ChallengeHoldEndNote,
  NormalHoldEndNote,

  MissEffect,
})
