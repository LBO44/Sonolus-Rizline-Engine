import { Bucket, Range, SkinSprite } from "@sonolus/sonolus.js-compiler/play";
import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { isUsed, markAsUsed } from "../InputManager";
import { judgeLineX } from "../shared";
import { Note } from "./Note";
import { skin } from "../../skin";

export class TapNote extends Note {

  sprite = skin.sprites.noteTap
  bucket = buckets.TapNote
  judgementWindow= {
  perfect: Range.one.mul(0.045),
  great: Range.one.mul(0.09),
  good: Range.one.mul(0.09)
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

      switch (this.result.judgment) {
        case Judgment.Perfect:
          effect.clips.perfect.play(0.02)
          break
        case Judgment.Great:
          effect.clips.great.play(0.02)
          break
        case Judgment.Good:
          effect.clips.good.play(0.02)
          break
      }

      const layout = Rect.one.mul(0.2).translate(judgeLineX, this.pos.y)
      particle.effects.note.spawn(layout, 0.5, false)

      this.despawn = true
      return
    }
  }
}
