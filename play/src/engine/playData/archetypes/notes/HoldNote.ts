import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { skin } from "../../skin";
import { isUsed, markAsUsed } from "../InputManager";
import { game, scaleX, toLineX, toLineY } from "../shared";
import { Note } from "./Note";

export class HoldNote extends Note {

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    Beat: { name: "Beat", type: Number },
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
    HoldEndBeat: { name: "HoldEndBeat", type: Number },
  })

  sprite = skin.sprites.noteHold
  bucket = buckets.TapNote
  judgementWindow = {
    perfect: Range.one.mul(0.045),
    great: Range.one.mul(0.09),
    good: Range.one.mul(0.09)
  }
  noteRadius = 0.07

  failed = this.entityMemory(Boolean)
  pos = this.entityMemory({ x: Number, y: Number, xEnd: Number })
  endTime = this.entityMemory(Number)

  preprocess(): void {
    super.preprocess()

    this.inputTime.copyFrom(this.judgementWindow.good.add(this.hitTime).add(input.offset))
    this.endTime = bpmChanges.at(this.import.HoldEndBeat).time
  }


  touchId = this.entityMemory(Number)
  touchStarted = this.entityMemory(Boolean)
  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {
      if (!this.touchStarted) {
        if (touch.started) continue
        if (isUsed(touch)) continue
        this.touchStart(touch)
        return
      }
      else {
        if (touch.id === this.touchId) {
          if (!touch.ended) {
            this.touchHold(touch)
            return
          }
          else {
            this.touchEnd(touch)
          }
        }
      }
    }
  }

  touchEnd(touch: Touch) {
    this.despawn
  }

  touchHold(touch: Touch) {
    markAsUsed(touch)
  }

  touchStart(touch: Touch) {
    markAsUsed(touch)
    this.touchId = this.touchId
    this.touchStarted = true
    this.result.accuracy = touch.startTime - this.hitTime
    this.result.judgment = input.judge(touch.startTime, this.hitTime, this.judgementWindow)

    this.result.bucket.index = this.bucket.index
    this.result.bucket.value = this.result.accuracy * 1000

    effect.clips.Tap.play(0.02)

    const layout = Rect.one.mul(0.2).translate(game.XMax, this.pos.y)
    particle.effects.note.spawn(layout, 0.5, false)


  }



  getPos() {
    if (this.touchStarted) this.pos.x = game.XMax
    else this.pos.x = toLineX(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
    this.pos.xEnd = toLineX(this.import.HoldEndBeat, this.import.LastPoint, this.import.NextPoint)
    this.pos.y = toLineY(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
  }

  draw() {
    const startLayout = Rect.one.mul(this.noteRadius)
    const holdLayout = new Rect({
      l: this.pos.xEnd,
      r: this.pos.x,
      b: this.pos.y - this.noteRadius,
      t: this.pos.y + this.noteRadius
    })
    skin.sprites.noteHoldConnectorNormal.draw(holdLayout, 10, 1)
    this.sprite.draw(startLayout.translate(Math.max(this.pos.x, game.Xmin), this.pos.y), 5, 1)
    skin.sprites.noteHoldStartNormal.draw(startLayout.translate(Math.max(this.pos.x, game.Xmin), this.pos.y), 6, 1)
  }

  updateSequential() {
    if (this.endTime + input.offset < time.now) this.despawn = true
    this.getPos()
    if (this.pos.x < game.Xmin) return
    this.draw()
  }

}






