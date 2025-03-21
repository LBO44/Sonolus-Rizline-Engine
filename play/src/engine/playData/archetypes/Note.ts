import { archetypes } from "."
import { skin } from "../skin"
import { scaleX, speed, yOnLine } from "./shared"

export class Note extends Archetype {
  import = this.defineImport({
    Line: { name: "Line", type: Number },
    Time: { name: "Time", type: Number },
    LastLinePoint: { name: "LastPoint", type: Number },
    NextLinePoint: { name: "NextPoint", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  endTime = this.entityMemory(Number)
  hasInput = true

  preprocess() {
    this.spawnTime = bpmChanges.at(this.import.Time).time - 10 / speed
    this.endTime = bpmChanges.at(this.import.Time).time
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateSequential() {
    const x = scaleX(this.import.Time)
    if (this.endTime < time.now) this.despawn = true


    const y = yOnLine(this.import.Time, this.import.LastLinePoint, this.import.NextLinePoint)
    const debugLayout = Rect.one.mul(0.05)
    skin.sprites.judgeRingGreen.draw(debugLayout.translate(x, y), 5, 0.8)

  }
}
