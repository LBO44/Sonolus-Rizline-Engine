import { archetypes } from "."
import { canvas, spawnBeatToTime } from "./shared"

/** NextCanvasSpeed entity updates the "canvas.speed level memory of its canvas
 *by interpolating the value of itself and the next Canvasspeed entity with their hitTime*/
export class CanvasSpeed extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextCanvasSpeed: { name: "NextCanvasSpeed", type: Number },
    Canvas: { name: "Canvas", type: Number },
    Speed: { name: "Speed", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number) // the next CanvasSpeed's hit time
  hitTime = this.entityMemory(Number)

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat) //spawn early so that it doesn't hang spawn queue 
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.nextTime = bpmChanges.at(archetypes.CanvasSpeed.import.get(this.import.NextCanvasSpeed).Beat).time
  }

  shouldSpawn() {
    return this.spawnTime <= time.now

  }

  updateSequential() {
    if (this.import.Beat == 0) {
      canvas.speed.set(this.import.Canvas, this.import.Speed)
      this.despawn = true
    }

    if (this.hitTime >= time.now) return
    if (this.nextTime <= time.now) this.despawn = true


    const lt = this.hitTime
    const ls = this.import.Speed

    const n = archetypes.CanvasSpeed.import.get(this.import.NextCanvasSpeed)
    const nt = bpmChanges.at(n.Beat).time
    const ns = n.Speed

    const s = Math.lerp(ls, ns, Math.remapClamped(lt, nt, 0, 1, time.now))
    canvas.speed.set(this.import.Canvas, s)
  }
}

