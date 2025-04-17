import { canvas, ease, easeValue, spawnBeatToTime } from "../shared"

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
  /** Should update this.nextValue and this.nextTime */
  abstract getNextValue(): void

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.getNextValue()
  }

  shouldSpawn() {
    return this.spawnTime <= time.now
  }

  updateSequential() {
    if (this.hitTime >= time.now) return
    if (this.nextTime <= time.now) this.despawn = true

    if (this.nextTime === 0) {
      this.canvasVaraible.set(this.import.Canvas, this.import.Value)
      this.despawn = true
    }

    const lt = this.hitTime
    const ly = this.import.Value

    const nt = this.nextTime
    const ny = this.nextValue

    const y = easeValue(ly, ny, this.import.EaseType, time.now, lt, nt)
    this.canvasVaraible.set(this.import.Canvas, y)
  }
}
