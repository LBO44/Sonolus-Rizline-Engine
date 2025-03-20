import { archetypes } from "."
import { canvas, speed, } from "./shared"

export class CanvasMove extends Archetype {

  import = this.defineImport({
    Time: { name: "Time", type: Number },
    NextCanvas: { name: "NextCanvasMove", type: Number },
    canvasId: { name: "CanvasId", type: Number },
    YPos: { name: "YPos", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  despawnTime = this.entityMemory(Number)

  preprocess(): void {
    this.spawnTime = bpmChanges.at(this.import.Time).time 
    this.despawnTime = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvas).Time).time
  }
  shouldSpawn() {
    return true

  }

  updateSequential(): void {

    const t = this.import.Time
    const lx = this.import.YPos
    const nx = archetypes.CanvasMove.import.get(this.import.NextCanvas).YPos
    const lt = this.spawnTime
    const nt = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvas).Time).time
    const x = lx + (t - lt) / (nt - lt) * (nx - lx)
    canvas.yPos.set(this.import.canvasId, x)
  }
}
