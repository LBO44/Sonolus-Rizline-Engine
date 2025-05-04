import { archetypes } from "."
import { spawnBeatToTime } from "./shared"

export class LineColorKeyPoint extends Archetype {
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
    this.nextTime = bpmChanges.at(archetypes.LineColorKeyPoint.import.get(this.import.NextPoint).Beat).time
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateSequential() {
    if (entityInfos.get(this.import.Line).state === EntityState.Waiting) return
    if (time.now > this.nextTime) this.despawn = true
    if (time.now >= bpmChanges.at(this.import.Beat).time) {
      archetypes.Line.color.get(this.import.Line).line.colorIndex = this.import.ColorIndex
      archetypes.Line.color.get(this.import.Line).line.alpha = this.import.Alpha
    }
  }
}
