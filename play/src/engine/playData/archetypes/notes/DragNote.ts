import { Bucket } from "@sonolus/sonolus.js-compiler/play";
import { skin } from "../../skin";
import { Note } from "./Note";
import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { game } from "../shared";
import { options } from "../../../configuration/options";

export class DragNote extends Note {
  sprite = skin.sprites.noteDrag
  bucket = buckets.DragNote
  judgementWindow = {
    perfect: Range.one.mul(0.000),
    great: Range.one.mul(0.000),
    good: Range.one.mul(0.000)
  }

  draw() {
    const noteRadius = 0.045 * options.NoteSize
    const noteLayout = Rect.one.mul(noteRadius)
    this.sprite.draw(noteLayout.translate(this.pos.x, this.pos.y), 5, 1)
  }

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {

      this.result.accuracy = 0
      this.result.judgment = Judgment.Perfect

      this.result.bucket.index = this.bucket.index
      this.result.bucket.value = this.result.accuracy * 1000

      effect.clips.Drag.play(0.02)

      const layout = Rect.one.mul(0.2).translate(game.XMax, this.pos.y)
      particle.effects.note.spawn(layout, 0.5, false)

      this.despawn = true
      return
    }
  }

}
