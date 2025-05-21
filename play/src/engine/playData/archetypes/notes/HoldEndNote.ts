import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { buckets } from "../../buckets"
import { skin } from "../../skin"
import { game, levelMem, scaleX, spawnBeatToTime } from "../shared"
import { bucketWindows, judgeWindows } from "./windows"

export class HoldEndNote extends Archetype {
  hasInput = true

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    EndBeat: { name: "EndBeat", type: Number },
    Line: { name: "Line", type: Number },
    HoldStart: { name: "HoldStart", type: Number },
  })

  judgementWindow = judgeWindows.holdEnd
  bucket = buckets.HoldNoteEnd

  sharedMemory = this.defineSharedMemory({
    touchId: TouchId,
    fakeY: Number
  })

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  startTime = this.entityMemory(Number)

  inputTime = this.entityMemory(Range)
  pos = this.entityMemory({ xStart: Number, xEnd: Number, y: Number })

  globalPreprocess() {
    this.bucket.set(bucketWindows.holdEnd)
  }

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.startTime = bpmChanges.at(archetypes.HoldNote.import.get(this.import.HoldStart).Beat).time
    this.hitTime = bpmChanges.at(this.import.EndBeat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.hitTime).add(input.offset))
  }

  spawnOrder() {
    return 1001 + this.spawnTime
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  touch() {
    const id = this.sharedMemory.touchId
    if (!id) return

    for (const touch of touches) {
      if (touch.id !== id) continue

      if (!touch.ended && time.now <= this.hitTime) return //Finger release not needed I think 

      if (time.now >= this.inputTime.min) this.completeTouch(touch.ended ? touch.t : this.hitTime)
      else this.missEffect(time.now)

      this.despawn = true
      return
    }
  }

  completeTouch(time: number) {
    this.result.accuracy = time - this.hitTime
    this.result.judgment = input.judge(time, this.hitTime, this.judgementWindow)

    this.result.bucket.index = this.bucket.index
    this.result.bucket.value = this.result.accuracy * 1000
  }

  getPos() {
    this.pos.y = this.sharedMemory.fakeY //ToDo: make it use the Line Y when Start despasn

    const StartExist = entityInfos.get(this.import.HoldStart).state == EntityState.Active
    this.pos.xStart = StartExist ? archetypes.HoldNote.sharedMemory.get(this.import.HoldStart).pos.x : game.XMax
    this.pos.xEnd = scaleX(this.hitTime, archetypes.LinePoint.import.get(archetypes.HoldNote.import.get(this.import.HoldStart).LastPoint).Canvas)
  }

  missEffect(time: number) {
    if (options.MissEffect) archetypes.MissEffect.spawn({ startTime: time, yPos: this.pos.y })
  }

  drawLine() {
    const noteRadius = 0.07 * options.NoteSize
    const layout = new Rect({
      t: noteRadius,
      b: -noteRadius,
      l: Math.max(game.Xmin, Math.min(this.pos.xEnd, game.XMax)),
      r: Math.min(this.pos.xStart, game.XMax)
    }).translate(0, this.pos.y)

    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldConnectorChallenge.id : skin.sprites.noteHoldConnectorNormal.id
    skin.sprites.draw(spriteId, layout, 50, 1)
  }

  drawStartNote() {
    const noteRadius = 0.07 * options.NoteSize
    const noteLayout = Rect.one.mul(noteRadius)
    const x = Math.min(this.pos.xStart, game.XMax)
    skin.sprites.noteHold.draw(noteLayout.translate(Math.max(x, game.Xmin), this.pos.y), 5, 1)

    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldStartChallenge.id : skin.sprites.noteHoldStartNormal.id
    skin.sprites.draw(spriteId, noteLayout.translate(x, this.pos.y), 100, 1)
  }

  updateParallel() {
    if (this.inputTime.max < time.now) {
      this.missEffect(time.now)
      this.despawn = true
    }

    this.getPos()

    if (this.pos.xStart < game.Xmin) return
    this.drawStartNote()
    this.drawLine()
  }


}
