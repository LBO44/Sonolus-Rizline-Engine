import { archetypes } from "."
import { skin } from "../skin"
import { scaleX, scaleY, speed, yOnLine } from "./shared"

export class Note extends Archetype {
  import = this.defineImport({
    Line: { name: "Line", type: Number },
    Time: { name: "Time", type: Number },
    LastLinePoint: { name: "LastPoint", type: Number },
    NextLinePoint: { name: "NextPoint", type: Number }
  })

  hitTime = this.entityMemory(Number)
  endTime = this.entityMemory(Number)


  preprocess() {
    this.hitTime = bpmChanges.at(this.import.Time).time - 10 / speed
    this.endTime = bpmChanges.at(this.import.Time).time
  }

  shouldSpawn() {
    return time.now >= this.hitTime
  }

  updateSequential() {
    const x = scaleX(this.import.Time)
    if (this.endTime < time.now) this.despawn = true
    const lx = archetypes.LinePoint.pos.get(this.import.LastLinePoint).x
    const ly = archetypes.LinePoint.pos.get(this.import.LastLinePoint).y

    const nx = archetypes.LinePoint.pos.get(this.import.NextLinePoint).x
    const ny = archetypes.LinePoint.pos.get(this.import.NextLinePoint).y

    //const y = ly + (x - lx) / (nx - lx) * (ny - ly)
const y = yOnLine(this.hitTime,this.import.LastLinePoint,this.import.NextLinePoint)
    const debugLayout = Rect.one.mul(0.05)
    skin.sprites.judgeRingGreen.draw(debugLayout.translate(x, y), 5, 0.8)

  }
}
