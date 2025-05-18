import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { game, spawnBeatToTime, toLineX, toLineY } from "../shared"

export abstract class Note extends Archetype {
  hasInput = true
  touchOrder = 1

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  inputTime = this.entityMemory(Range)
  pos = this.entityMemory({ x: Number, y: Number })

  abstract bucket: Bucket
  abstract judgementWindow: {
    perfect: Range
    great: Range
    good: Range
  }
  abstract bucketWindow: JudgmentWindows
  abstract draw(): void

  globalPreprocess() {
    this.bucket.set(this.bucketWindow)
    this.life.set({
      perfect: 10,
      great: 0,
      good: -12,
      miss: -60,
    })
  }

  spawnOrder() {
    return 1000 + this.spawnTime
  }


  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.hitTime).add(input.offset))
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  getPos() {
    this.pos.x = toLineX(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
    this.pos.y = toLineY(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
  }

  updateParallel() {
    if (this.inputTime.max < time.now) {
      if (options.MissEffect) archetypes.MissEffect.spawn({ startTime: time.now, yPos: this.pos.y })
      this.result.judgment = Judgment.Miss
      this.despawn = true
    }
    this.getPos()
    if (this.pos.x < game.Xmin) return
    this.draw()
  }

}
