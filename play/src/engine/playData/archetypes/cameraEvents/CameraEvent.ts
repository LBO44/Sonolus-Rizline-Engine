import { camera, ease, spawnBeatToTime } from "../shared"

export abstract class CameraEvent extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number },
    NextCameraEntity: { name: "NextCameraEntity", type: Number },
    Value: { name: "Value", type: Number },
    EaseType: { name: "EaseType", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number)
  nextValue = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  abstract cameraVaraible: (typeof camera)[keyof typeof camera]
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
    if (this.import.EaseType === 0) {
      this.cameraVaraible = this.import.Value
      this.despawn = true
    }

    if (this.hitTime >= time.now) return
    if (this.nextTime <= time.now) this.despawn = true

    const lt = this.hitTime
    const ly = this.import.Value

    const nt = this.nextTime
    const ny = this.nextValue

    const y = ease(ly, ny, this.import.EaseType, time.now, lt, nt)
    this.cameraVaraible = y
  }
}
