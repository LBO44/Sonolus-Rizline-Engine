import { levelMem, spawnBeatToTime } from "./shared"

abstract class ChallengeTime extends Archetype {
  abstract value: boolean

  import = this.defineImport({
    Beat: { name: "Beat", type: Number }
  })

  shouldSpawn() {
    return time.now >= spawnBeatToTime(this.import.Beat)
  }

  updateSequential() {
    if (time.now < bpmChanges.at(this.import.Beat).time) return
    levelMem.isChallenge = this.value
  }
}

export class ChallengeStart extends ChallengeTime {
  value = true
}

export class ChallengeEnd extends ChallengeTime {
  value = false
}
