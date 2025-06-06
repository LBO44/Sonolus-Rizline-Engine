import { archetypes } from ".."
import { buckets } from "../../buckets"
import { effect } from "../../effect"
import { particle } from "../../particle"
import { isUsed, markAsUsed } from "../InputManager"
import { game, spawnBeatToTime } from "../shared"
import { Note } from "./Note"
import { bucketWindows, judgeWindows } from "./windows"

/** Only for inputs and calculating pos */
export class HoldNote extends Note {

  holdEnd = this.defineImport({
    Entity: { name: "HoldEnd", type: Number }
  })

  bucket = buckets.HoldNoteStart
  judgementWindow = judgeWindows.tapNote
  bucketWindow = bucketWindows.tapNote

  sharedMemory = this.defineSharedMemory({
    pos: { x: Number },
  })

  preprocess() {
    super.preprocess()

    //Best way i could think of to not draw it before the start entity spawned
    this.spawnTime = spawnBeatToTime(this.import.Beat) - 1
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
    //draw is handled by End entity since we need to still draw it after judgment
  }

  updateSequential() {
    this.sharedMemory.pos.x = this.pos.x

    archetypes.HoldEndNote.sharedMemory.get(this.holdEnd.Entity).fakeY = this.pos.y
  }

}






