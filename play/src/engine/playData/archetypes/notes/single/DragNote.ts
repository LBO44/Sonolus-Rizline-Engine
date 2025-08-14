import { options } from "../../../../configuration/options"
import { buckets } from "../../../buckets"
import { effect } from "../../../effect"
import { skin } from "../../../skin"
import { bucketWindows, judgeWindows } from "../windows"
import { SingleNote } from "./SingleNote"

abstract class DragNote extends SingleNote {
  bucket = buckets.DragNote

  judgementWindow = judgeWindows.dragNote
  bucketWindow = bucketWindows.dragNote

  effect = effect.clips.Drag

  touch() {
    if (this.inputTime.min > time.now) return
    for (const touch of touches) {
      this.setTouchResult(Math.max(touch.startTime, this.targetTime))

      if (this.shouldPlaySFX) this.effect.play(0.02)
      this.spawnParticle(this.pos.y)
      this.despawn = true
      return
    }
  }

  draw() {
    const noteRadius = 0.045 * options.noteSize
    const noteLayout = Rect.one.mul(noteRadius)
    skin.sprites.noteDrag.draw(noteLayout.translate(this.pos.x, this.pos.y), 5, 1)
  }
}

export class NormalDragNote extends DragNote {
  isChallenge = false
}

export class ChallengeDragNote extends DragNote {
  isChallenge = true
}
