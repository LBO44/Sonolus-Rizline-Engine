import { skin } from "../skin"
import { spawnBeatToTime } from "./shared"

export class Line extends Archetype {

  import = this.defineImport({
    SpawnBeat: { name: "SpawnBeat", type: Number },
    EndBeat: { name: "EndBeat", type: Number },
  })

  color = this.defineSharedMemory({
    line: {
      colorIndex: Number,
      alpha: Number
    },
    judgeRing: {
      colorIndex: Number,
      alpha: Number
    }
  })

  pos = this.defineSharedMemory({
    y:Number
  })

  spawnTime = this.entityMemory(Number)
  despawnTime = this.entityMemory(Number)


  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.SpawnBeat)
    this.despawnTime = bpmChanges.at(this.despawnTime).time
  }
  spawnOrder() {
    return 0
  }
  shouldSpawn() {
    return true || time.now >= this.spawnTime
  }
}
