import { game, spawnBeatToTime, toLineX, toLineY} from "../shared"

export abstract class Note extends Archetype {
  hasInput = true
  touchOrder = 1

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    Beat: { name: "Beat", type: Number },
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  inputTime = this.entityMemory(Range)
  pos = this.entityMemory({ x: Number, y: Number })

  abstract sprite: SkinSprite
  abstract bucket: Bucket
  abstract judgementWindow: {
    perfect: Range
    great: Range
    good: Range
  }
  abstract noteRadius: number


  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.Beat)
    this.hitTime = bpmChanges.at(this.import.Beat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.hitTime).add(input.offset))
    this.bucket.set(this.judgementWindow)
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  getPos() {
    this.pos.x = toLineX(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
    this.pos.y = toLineY(this.import.Beat, this.import.LastPoint, this.import.NextPoint)
  }

  draw() {
    const noteLayout = Rect.one.mul(this.noteRadius)
    this.sprite.draw(noteLayout.translate(this.pos.x, this.pos.y), 5, 0.8)
  }

  updateSequential() {
    if (this.inputTime.max < time.now) this.despawn = true
    this.getPos()
    if (this.pos.x < game.Xmin) return
    this.draw()
  }
}
