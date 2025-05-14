import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { isUsed, markAsUsed } from "../InputManager";
import { Note } from "./Note";
import { skin } from "../../skin";
import { game, levelMem } from "../shared";
import { options } from "../../../configuration/options";
import { bucketWindows, judgeWindows } from "./windows";

export class TapNote extends Note {

  bucket = buckets.TapNote

  judgementWindow = judgeWindows.tapNote
  bucketWindow = bucketWindows.tapNote

  draw() {
    const noteRadius = 0.07 * options.NoteSize
    const noteLayout = Rect.one.mul(noteRadius)
    const spriteId = levelMem.isChallenge ? skin.sprites.noteTapChallenge.id : skin.sprites.noteTapNormal.id
    skin.sprites.draw(spriteId, noteLayout.translate(this.pos.x, this.pos.y), 5, 1)
  }

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {
      if (!touch.started) continue
      if (isUsed(touch)) continue

      markAsUsed(touch)
      this.result.accuracy = touch.startTime - this.hitTime
      this.result.judgment = input.judge(touch.startTime, this.hitTime, this.judgementWindow)

      this.result.bucket.index = this.bucket.index
      this.result.bucket.value = this.result.accuracy * 1000

      effect.clips.Tap.play(0.02)

      const layout = Rect.one.mul(0.2).translate(game.XMax, this.pos.y)
      particle.effects.note.spawn(layout, 0.5, false)

      this.despawn = true
      return
    }
  }
}
