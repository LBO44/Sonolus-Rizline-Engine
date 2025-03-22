import { archetypes } from "."
import { canvas, spawnBeatToTime } from "./shared"

/** CanvasMove entity updates the "canvas.ypos" level memory of its canvas
 *by interpolating the value of itself and the next CanvasMove entity with their hitTime*/
export class CanvasMove extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextCanvasMove: { name: "NextCanvasMove", type: Number },
    Canvas: { name: "Canvas", type: Number },
    YPos: { name: "YPos", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number) // the next CanvasMove's hit time
  hitTime = this.entityMemory(Number)

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat) //spawn early so that it doesn't hang spawn queue 
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.nextTime = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvasMove).Beat).time
  }

  shouldSpawn() {
    return this.spawnTime <= time.now

  }

  updateSequential() {
    if (this.import.Beat == 0) {
      canvas.yPos.set(this.import.Canvas, this.import.YPos)
      this.despawn = true
    }

    if (this.hitTime >= time.now) return
    if (this.nextTime <= time.now) this.despawn = true

    const lt = this.hitTime
    const ly = this.import.YPos

    const n = archetypes.CanvasMove.import.get(this.import.NextCanvasMove)
    const nt = bpmChanges.at(n.Beat).time
    const ny = n.YPos

    const y = Math.lerp(ly, ny, Math.remapClamped(lt, nt, 0, 1, time.now))
    debug.log(y)
    canvas.yPos.set(this.import.Canvas, y)
  }
}
