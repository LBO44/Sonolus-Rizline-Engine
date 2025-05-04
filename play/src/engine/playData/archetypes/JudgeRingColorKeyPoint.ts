
import { archetypes } from "."
import { spawnBeatToTime } from "./shared"

export class JudgeRingColorKeyPoint extends Archetype {
  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
    Line: { name: "Line", type: Number },
    ColorIndex: { name: "ColorIndex", type: Number },
    Alpha: { name: "Alpha", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number)
  nextValue = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.nextTime = bpmChanges.at(archetypes.JudgeRingColorKeyPoint.import.get(this.import.NextPoint).Beat).time
  }
  spawnOrder(): number {
    return 0
  }
  shouldSpawn() {
    return true || time.now >= this.spawnTime
  }

  updateSequential() {
    if (entityInfos.get(this.import.Line).state === EntityState.Waiting) return
    if (time.now > this.nextTime) this.despawn = true
    if (time.now >= bpmChanges.at(this.import.Beat).time) {
      archetypes.Line.color.get(this.import.Line).judgeRing.colorIndex = this.import.ColorIndex
      archetypes.Line.color.get(this.import.Line).judgeRing.alpha = this.import.Alpha
    }
  }
}
