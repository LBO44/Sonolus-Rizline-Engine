import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { buckets } from "../../buckets"
import { skin } from "../../skin"
import { game, levelMem, scaleX } from "../shared"
import { Note } from "./Note"
import { bucketWindows, judgeWindows } from "./windows"

abstract class HoldEndNote extends Note {
  touchOrder = 2 //needs to be after hold start

  holdEndImport = this.defineImport({
    EndBeat: { name: "EndBeat", type: Number },
    Line: { name: "Line", type: Number },
    HoldStart: { name: "HoldStart", type: Number },
  })

  judgementWindow = judgeWindows.holdEnd
  bucketWindow = bucketWindows.holdEnd
  bucket = buckets.HoldNoteEnd

  sharedMemory = this.defineSharedMemory({
    fakeY: Number,
  })

  startTime = this.entityMemory(Number)

  inputTime = this.entityMemory(Range)
  startInputTime = this.entityMemory(Range)
  pos = this.entityMemory({ xStart: Number, xEnd: Number, y: Number })

  wasJudged = this.entityMemory(Boolean)
  holdTouchIds = this.entityMemory(Collection(6, TouchId))

  get startWasHit() {
    // shouldn't matter whether it's a Normal or Challenge Note
    return archetypes.NormalHoldNote.tappableSharedMemory.get(this.holdEndImport.HoldStart).wasHit
  }

  preprocess() {
    super.preprocess()
    this.startTime = bpmChanges.at(archetypes.NormalHoldNote.noteImport.get(this.holdEndImport.HoldStart).Beat).time
    this.targetTime = bpmChanges.at(this.holdEndImport.EndBeat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.targetTime).add(input.offset))

    this.startInputTime.copyFrom(judgeWindows.tapNote.good.add(this.startTime).add(input.offset))
  }

  touch() {
    if (this.wasJudged) return
    if (!this.startWasHit) return

    let lastReleaseTime = 0
    let anyTouchActive = false

    for (const touch of touches) {
      // add touch that started during the start
      if (this.startInputTime.contains(touch.startTime)) {
        this.holdTouchIds.add(touch.id)
        continue
      }
    }

    for (const touch of touches) {
      if (!this.holdTouchIds.has(touch.id)) continue

      if (touch.ended) {
        lastReleaseTime = Math.max(touch.time, lastReleaseTime)
      } else {
        anyTouchActive = true
      }
    }

    if (!anyTouchActive && this.holdTouchIds.count > 0) {
      this.wasJudged = true
      this.setTouchResult(lastReleaseTime)

      if (lastReleaseTime < this.inputTime.min) {
        this.despawn = true //only despwna if miss, if early keep until hit time
        this.missEffect(lastReleaseTime, this.pos.y)
      }
    }
  }

  getPos() {
    const lineY = archetypes.Line.pos.get(this.holdEndImport.Line).y //TODO - not working
    this.pos.y = time.now <= this.startTime ? this.sharedMemory.fakeY : lineY

    const StartExist = entityInfos.get(this.holdEndImport.HoldStart).state == EntityState.Active
    this.pos.xStart = StartExist ? archetypes.NormalHoldNote.sharedMemory.get(this.holdEndImport.HoldStart).posX : game.XMax
    this.pos.xEnd = scaleX(
      this.targetTime,
      archetypes.LinePoint.import.get(archetypes.NormalHoldNote.singleNoteImport.get(this.holdEndImport.HoldStart).LastPoint).Canvas,
    )
  }

  drawLine() {
    const noteRadius = 0.07 * options.noteSize
    const layout = new Rect({
      t: noteRadius,
      b: -noteRadius,
      l: Math.clamp(this.pos.xEnd, game.Xmin, game.XMax),
      r: Math.min(this.pos.xStart, game.XMax),
    }).translate(-noteRadius, this.pos.y)

    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldConnectorChallenge.id : skin.sprites.noteHoldConnectorNormal.id
    skin.sprites.draw(spriteId, layout, 70, 1)
  }

  drawStartNote() {
    const noteRadius = 0.07 * options.noteSize
    const noteLayout = Rect.one.mul(noteRadius)
    const x = Math.min(this.pos.xStart, game.XMax)
    skin.sprites.noteHold.draw(noteLayout.translate(x, this.pos.y), 5, 1)

    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldStartChallenge.id : skin.sprites.noteHoldStartNormal.id
    skin.sprites.draw(spriteId, noteLayout.translate(x, this.pos.y), 80, 1)
  }

  updateParallel() {
    const startState = entityInfos.get(this.holdEndImport.HoldStart).state
    if (startState == EntityState.Waiting) return

    if (startState == EntityState.Despawned && !this.startWasHit) {
      this.despawn = true
      return
    }

    if (this.inputTime.max <= time.now) {
      this.despawn = true
      this.spawnParticle(this.pos.y)
      if (!this.wasJudged) {
        this.setTouchResult(this.targetTime)
      }
    }

    this.getPos()

    if (!this.pos.xStart || this.pos.xStart < game.Xmin) return
    this.drawStartNote()
    this.drawLine()
  }
}

export class NormalHoldEndNote extends HoldEndNote {
  isChallenge = false
}

export class ChallengeHoldEndNote extends HoldEndNote {
  isChallenge = true
}
