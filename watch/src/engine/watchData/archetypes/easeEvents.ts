import { ease } from "../../../../../shared/src/utilities"

export const canvasPos = levelMemory(Tuple(128, Number)) //currently one chart has uo to 55

export const camera = levelMemory({
  pos: Number,
  scale: Number
})

abstract class EaseEvent extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    Value: { name: "Value", type: Number },
    EaseType: { name: "EaseType", type: Number },
    NextEventEntity: { name: "NextEventEntity", type: Number },
  })

  endTime = this.entityMemory(Number)
  endValue = this.entityMemory(Number)
  startTime = this.entityMemory(Number)

  get nextImport() {
    return this.import.get(this.import.NextEventEntity)
  }

  get isLastEvent() {
    return !this.import.NextEventEntity
  }

  abstract set levelMemoryVariable(value: number)

  preprocess() {
    this.startTime = bpmChanges.at(this.import.Beat).time

    this.endValue = this.nextImport.Value
    this.endTime = bpmChanges.at(this.nextImport.Beat).time
  }

  spawnTime() {
    return this.startTime
  }

  despawnTime() {
    return this.isLastEvent ? 999999 : this.endTime
  }

  updateSequential() {

    if (this.isLastEvent) {
      this.levelMemoryVariable = this.import.Value
      return
    }

    const x = ease(
      Math.remap(this.startTime, this.endTime, 0, 1, time.now),
      this.import.EaseType
    )

    this.levelMemoryVariable = Math.lerp(this.import.Value, this.nextImport.Value, x)
  }

}


export class CanvasMove extends EaseEvent {

  canvasEventImport = this.defineImport({
    id: { name: "Canvas", type: Number },
  })

  set levelMemoryVariable(value: number) {
    canvasPos.set(this.canvasEventImport.id, value)
  }

}

export class CameraMove extends EaseEvent {

  set levelMemoryVariable(value: number) {
    camera.pos = value
  }

}

export class CameraScale extends EaseEvent {

  set levelMemoryVariable(value: number) {
    camera.scale = value
  }

}


