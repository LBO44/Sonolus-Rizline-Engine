import { archetypes } from "../../.."
import { buckets } from "../../../../buckets"
import { effect } from "../../../../effect"
import { isUsed, markAsUsed } from "../../../InputManager"
import { bucketWindows, judgeWindows } from "../../windows"
import { TappabaNote } from "./TappableNote"

/** Only for input/judgement and calculating pos */
abstract class HoldNote extends TappabaNote {
  holdImport = this.defineImport({
    HoldEnd: { name: "HoldEnd", type: Number },
  })

  bucket = buckets.HoldNoteStart

  judgementWindow = judgeWindows.tapNote
  bucketWindow = bucketWindows.tapNote

  effect = effect.clips.Tap

  sharedMemory = this.defineSharedMemory({
    posX: Number,
  })

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {
      if (!touch.started) continue
      if (isUsed(touch)) continue

      if (this.shouldSkipTouchForSidePriority(touch)) continue

      markAsUsed(touch)

      this.tappableSharedMemory.wasHit = true

      archetypes.NormalHoldEndNote.sharedMemory.get(this.holdImport.HoldEnd).fakeY = this.pos.y

      this.setTouchResult(touch.startTime)

      if (this.shouldPlaySFX) this.effect.play(0.02)
      this.spawnParticle(this.pos.y)

      this.despawn = true
      return
    }
  }

  draw() {
    //draw is handled by End entity since we need to still draw it after judgment
  }

  updateSequential() {
    this.sharedMemory.posX = this.pos.x

    archetypes.NormalHoldEndNote.sharedMemory.get(this.holdImport.HoldEnd).fakeY = this.pos.y
  }
}

export class NormalHoldNote extends HoldNote {
  isChallenge = false
}

export class ChallengeHoldNote extends HoldNote {
  isChallenge = true
}
