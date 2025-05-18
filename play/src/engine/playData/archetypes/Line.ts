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
    y: Number
  })

  spawnTime = this.entityMemory(Number)
  despawnTime = this.entityMemory(Number)

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.SpawnBeat)
    this.despawnTime = bpmChanges.at(this.despawnTime).time
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }
}
