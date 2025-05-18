import { archetypes } from "..";
import { options } from "../../../configuration/options";
import { buckets } from "../../buckets";
import { effect } from "../../effect";
import { particle } from "../../particle";
import { skin } from "../../skin";
import { isUsed, markAsUsed } from "../InputManager";
import { game, levelMem } from "../shared";
import { Note } from "./Note";
import { bucketWindows, judgeWindows } from "./windows";

export class HoldNote extends Note {


  holdEnd = this.defineImport({
    Entity: { name: "HoldEnd", type: Number }
  })

  bucket = buckets.HoldNoteStart
  judgementWindow = judgeWindows.tapNote
  bucketWindow = bucketWindows.tapNote

  sharedMemory = this.defineSharedMemory({
    pos: { x: Number, y: Number },
  })

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  touch() {
    if (this.inputTime.min > time.now) return

    for (const touch of touches) {
      if (!touch.started) continue
      if (isUsed(touch)) continue

      markAsUsed(touch)

      archetypes.HoldEndNote.sharedMemory.get(this.holdEnd.Entity).touchId = touch.id
      archetypes.HoldEndNote.sharedMemory.get(this.holdEnd.Entity).fakeY = this.pos.y

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

  draw() {
    const noteRadius = 0.07 * options.NoteSize
    const noteLayout = Rect.one.mul(noteRadius)
    const x = Math.min(this.pos.x, game.XMax)
    skin.sprites.noteHold.draw(noteLayout.translate(Math.max(x, game.Xmin), this.pos.y), 5, 1)

    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldStartChallenge.id : skin.sprites.noteHoldStartNormal.id
    skin.sprites.draw(spriteId, noteLayout.translate(x, this.pos.y), 5, 1)
  }

  updateSequential() {
    this.sharedMemory.pos.x = this.pos.x
    this.sharedMemory.pos.y = this.pos.y
  }

}






