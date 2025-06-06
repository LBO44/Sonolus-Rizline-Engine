
/** Only used to store line color*/
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
    this.spawnTime = bpmChanges.at(this.import.SpawnBeat).time
    this.despawnTime = bpmChanges.at(this.import.EndBeat).time
    this.color.judgeRing.alpha = 1 //ehh not sure
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateParallel() {
    debug.log(this.import.SpawnBeat * 10000 + time.now)
    if (this.despawnTime <= time.now) this.despawn = true
  }
}
