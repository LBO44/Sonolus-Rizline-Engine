import { archetypes } from ".."
import { canvas, spawnBeatToTime } from "../shared"



export abstract class CanvasEntity extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextCanvasEntity: { name: "NextCanvasEntity", type: Number },
    Canvas: { name: "Canvas", type: Number },
    Value: { name: "Value", type: Number },
    EaseType: { name: "EaseType", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number) 
  nextValue = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  abstract canvasVaraible: (typeof canvas)[keyof typeof canvas]
  abstract getNextValue(): void

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat) //spawn early so that it doesn't hang spawn queue 
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.nextTime = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvasEntity).Beat).time
    this.getNextValue()
  }

  shouldSpawn() {
    return this.spawnTime <= time.now
  }

  updateSequential() {
    if (this.import.EaseType === 0) {
      this.canvasVaraible.set(this.import.Canvas, this.import.Value)
      this.despawn = true
    }

    if (this.hitTime >= time.now) return
    if (this.nextTime <= time.now) this.despawn = true

    const lt = this.hitTime
    const ly = this.import.Value

    const nt = this.nextTime
    const ny = this.nextValue

    const y = Math.lerp(ly, ny, Math.remapClamped(lt, nt, 0, 1, time.now))
    this.canvasVaraible.set(this.import.Canvas, y)
  }
}
