import { levelMem } from "./shared"

abstract class ChallengeTime extends Archetype {
  abstract value: boolean

  import = this.defineImport({
    Beat: { name: "Beat", type: Number }
  })

  spawnTime = this.entityMemory(Number)

  preprocess() {
    this.spawnTime = bpmChanges.at(this.import.Beat).time
  }

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateSequential() {
    levelMem.isChallenge = this.value
    this.despawn = true
  }

}

export class ChallengeStart extends ChallengeTime {
  value = true
}

export class ChallengeEnd extends ChallengeTime {
  value = false
}
