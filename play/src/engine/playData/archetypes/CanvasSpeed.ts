
import { archetypes } from "."
import { canvas, speed  } from "./shared"

export class CanvasSpeed extends Archetype {

  import = this.defineImport({
    Time: { name: "Time", type: Number },
    NextCanvas: { name: "NextCanvasMove", type: Number },
    canvasId: { name: "CanvasId", type: Number },
    Speed: { name: "Speed", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  despawnTime = this.entityMemory(Number)

  preprocess(): void {
    this.spawnTime = bpmChanges.at(this.import.Time).time
    this.despawnTime = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvas).Time).time
  }
  shouldSpawn() {
    return false

  }

  updateSequential(): void {

    const t = this.import.Time
    const lx = this.import.Speed
    const nx = archetypes.CanvasSpeed.import.get(this.import.NextCanvas).Speed
    const lt = this.spawnTime
    const nt = bpmChanges.at(archetypes.CanvasSpeed.import.get(this.import.NextCanvas).Time).time
    const speed = lx
    canvas.speed.set(this.import.canvasId, speed)
  }
}
