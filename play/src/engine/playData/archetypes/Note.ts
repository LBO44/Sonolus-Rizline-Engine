import { skin } from "../skin"
import { spawnBeatToTime, toLineX, toLineY } from "./shared"

export class Note extends Archetype {

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    Beat: { name: "Beat", type: Number },
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  hasInput = true

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.hitTime = bpmChanges.at(this.import.Beat).time
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateSequential() {

    if (this.hitTime < time.now) this.despawn = true

    const y = toLineY(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
    const x = toLineX(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
    const noteLayout = Rect.one.mul(0.05)
    skin.sprites.judgeRingGreen.draw(noteLayout.translate(x, y), 5, 0.8)

  }
}
