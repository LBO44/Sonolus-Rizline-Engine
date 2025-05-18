import { canvas, easeValue } from "../shared"

export abstract class CanvasEntity extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextCanvasEntity: { name: "NextCanvasEntity", type: Number },
    Canvas: { name: "Canvas", type: Number },
    Value: { name: "Value", type: Number },
    EaseType: { name: "EaseType", type: Number }
  })

  nextTime = this.entityMemory(Number)
  nextValue = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  abstract canvasVaraible: (typeof canvas)[keyof typeof canvas]
  /** Should update this.nextValue and this.nextTime */
  abstract getNextValue(): void

  preprocess() {
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.getNextValue()
  }

  spawnOrder() {
    return 1000 + this.hitTime
  }


  shouldSpawn() {
    return this.hitTime <= time.now
  }

  updateSequentialOrder = 1

  updateSequential() {
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
