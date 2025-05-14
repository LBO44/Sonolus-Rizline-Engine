import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { buckets } from "../../buckets"
import { skin } from "../../skin"
import { game, levelMem, spawnBeatToTime, toLineX } from "../shared"
import { bucketWindows, judgeWindows } from "./windows"

export class HoldEndNote extends Archetype {
  hasInput = true

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    EndBeat: { name: "EndBeat", type: Number },
    Line: { name: "Line", type: Number },
    HoldStart: { name: "HoldStart", type: Number },
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
  })

  sharedMemory = this.defineSharedMemory({
    touchId: TouchId,
    fakeY: Number
  })

  judgementWindow = judgeWindows.holdEnd
  bucket = buckets.HoldNoteEnd

  touch() {
    if (this.inputTime.min > time.now) return
    if (entityInfos.get(this.import.HoldStart).state == 1) return

    for (const touch of touches) {
      if (touch.id != this.sharedMemory.touchId || !touch.ended) continue



      this.result.accuracy = touch.startTime - this.hitTime
      this.result.judgment = input.judge(touch.startTime, this.hitTime, this.judgementWindow)

      this.result.bucket.index = this.bucket.index
      this.result.bucket.value = this.result.accuracy * 1000

      this.despawn = true
      return
    }
  }

  globalPreprocess() {
    this.bucket.set(bucketWindows.holdEnd)
  }

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  startTime = this.entityMemory(Number)

  inputTime = this.entityMemory(Range)
  pos = this.entityMemory({ xStart: Number, xEnd: Number, y: Number })

  preprocess() {
    this.spawnTime = spawnBeatToTime(archetypes.HoldNote.import.get(this.import.HoldStart).Beat)
    this.startTime = bpmChanges.at(archetypes.HoldNote.import.get(this.import.HoldStart).Beat).time
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.hitTime).add(input.offset))
  }

  getPos() {
    const y = (entityInfos.get(this.import.Line).state == 1) ? archetypes.Line.pos.get(this.import.Line).y : this.sharedMemory.fakeY

    const StartExist = (entityInfos.get(this.import.Line).state)
    this.pos.y = StartExist ? archetypes.HoldNote.sharedMemory.get(this.import.HoldStart).pos.y : y
    this.pos.xStart = StartExist ? archetypes.HoldNote.sharedMemory.get(this.import.HoldStart).pos.x : game.XMax
    this.pos.xEnd = toLineX(
      this.import.EndBeat,
      this.import.LastPoint,
      this.import.NextPoint,
    )
  }

  draw() {
    const noteRadius = 0.07 * options.NoteSize
    const layout = new Rect({
      t: noteRadius,
      b: -noteRadius,
      l: this.pos.xEnd,
      r: this.pos.xStart
    }).translate(0, this.pos.y)
    const spriteId = levelMem.isChallenge ? skin.sprites.noteHoldConnectorChallenge.id : skin.sprites.noteHoldConnectorNormal.id
    skin.sprites.draw(spriteId, layout, 15, 1)
  }

  updateParallel() {
    if (this.inputTime.max < time.now) {
      this.despawn = true
    }

    debug.log(this.sharedMemory.touchId)

    this.getPos()
    if (this.pos.xStart <= game.Xmin || entityInfos.get(this.import.Line).state==0) return
    this.draw()
  }


}
