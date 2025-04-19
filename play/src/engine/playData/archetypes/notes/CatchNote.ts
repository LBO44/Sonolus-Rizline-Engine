import { Bucket } from "@sonolus/sonolus.js-compiler/play";
import { skin } from "../../skin";
import { Note } from "./Note";
import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { game } from "../shared";

export class CatchNote extends Note {
  sprite = skin.sprites.noteCatch
  bucket = buckets.CatchNote
  judgementWindow = {
    perfect: Range.one.mul(0.000),
    great: Range.one.mul(0.000),
    good: Range.one.mul(0.000)
  }

  noteRadius = 0.03

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {

      this.result.accuracy = 0
      this.result.judgment = Judgment.Perfect

      this.result.bucket.index = this.bucket.index
      this.result.bucket.value = this.result.accuracy * 1000

      effect.clips.Catch.play(0.02)

      const layout = Rect.one.mul(0.2).translate(game.XMax, this.pos.y)
      particle.effects.note.spawn(layout, 0.5, false)

      this.despawn = true
      return
    }
  }

}
