import { archetypes } from "."
import { skin } from "../skin"
import { game } from "./shared"

export class Stage extends Archetype {

  import = this.defineImport({
    Challenge1StartBeat: { name: "Challenge1StartBeat", type: Number },
    Challenge1EndBeat: { name: "Challenge1EndBeat", type: Number },
  })

  Challenge1StartTime = this.entityMemory(Number)
  Challenge1EndTime = this.entityMemory(Number)

  preprocess() {
    this.Challenge1StartTime = bpmChanges.at(this.import.Challenge1StartBeat).time
    this.Challenge1EndTime = bpmChanges.at(this.import.Challenge1EndBeat).time
  }

  shouldSpawn() {
    return true
  }

  updateParallel() {
    if (time.now > this.Challenge1StartTime && time.now < this.Challenge1EndTime)
      skin.sprites.backgroundChallenge.draw(screen.rect, 1, 1)
    else
      skin.sprites.backgroundNormal.draw(screen.rect, 1, 1)
  }
}
