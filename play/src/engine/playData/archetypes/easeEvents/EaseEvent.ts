import { easeValue } from "../shared"

/** lerp/ease a variable according to time.now between 2 points*/
export abstract class easeEvent extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextEventEntity: { name: "NextEventEntity", type: Number },
    Value: { name: "Value", type: Number },
    EaseType: { name: "EaseType", type: Number }
  })

  nextTime = this.entityMemory(Number)
  nextValue = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  abstract setVariable(value: number): void

  getNextValues() {
    const nextEntity = this.import.get(this.import.NextEventEntity)
    this.nextTime = bpmChanges.at(nextEntity.Beat).time
    this.nextValue = nextEntity.Value
  }

  preprocess() {
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.getNextValues()

    //not sure if this is good
    if (this.nextTime === 0 || this.import.EaseType === 0) {
      this.setVariable(this.import.Value)
      this.despawn = true
    }
  }

  spawnOrder() {
    return 1000 + this.hitTime
  }

  shouldSpawn() {
    return this.hitTime <= time.now
  }

  updateSequential() {
    if (this.nextTime <= time.now) this.despawn = true

    const lt = this.hitTime
    const ly = this.import.Value

    const nt = this.nextTime
    const ny = this.nextValue

    const y = easeValue(ly, ny, this.import.EaseType, time.now, lt, nt)
    this.setVariable(y)
  }
}
