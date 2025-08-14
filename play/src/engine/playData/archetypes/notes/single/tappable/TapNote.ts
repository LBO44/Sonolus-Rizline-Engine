import { options } from "../../../../../configuration/options"
import { buckets } from "../../../../buckets"
import { effect } from "../../../../effect"
import { skin } from "../../../../skin"
import { isUsed, markAsUsed } from "../../../InputManager"
import { levelMem } from "../../../shared"
import { bucketWindows, judgeWindows } from "../../windows"
import { TappabaNote } from "./TappableNote"

abstract class TapNote extends TappabaNote {
  bucket = buckets.TapNote

  judgementWindow = judgeWindows.tapNote
  bucketWindow = bucketWindows.tapNote

  effect = effect.clips.Tap

  draw() {
    const noteRadius = 0.07 * options.noteSize
    const noteLayout = Rect.one.mul(noteRadius)
    const spriteId = levelMem.isChallenge ? skin.sprites.noteTapChallenge.id : skin.sprites.noteTapNormal.id
    skin.sprites.draw(spriteId, noteLayout.translate(this.pos.x, this.pos.y), 5, 1)
  }

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {
      if (this.tappableSharedMemory.wasHit) return
      if (!touch.started) continue
      if (isUsed(touch)) continue

      if (this.shouldSkipTouchForSidePriority(touch)) continue

      markAsUsed(touch)

      this.tappableSharedMemory.wasHit = true //only needed if 1st double notes

      this.setTouchResult(touch.startTime)

      if (this.shouldPlaySFX) this.effect.play(0.02)
      this.spawnParticle(this.pos.y)

      this.despawn = true
      return
    }
  }

  updateSequential() {
    this.tappableSharedMemory.posY = this.pos.y
  }
}

export class NormalTapNote extends TapNote {
  isChallenge = false
}

export class ChallengeTapNote extends TapNote {
  isChallenge = true
}
