import { game, toLineX, toLineY } from "../../shared"
import { Note } from "../Note"

export abstract class SingleNote extends Note {
  touchOrder = 1

  singleNoteImport = this.defineImport({
    LastPoint: { name: "LastPoint", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
  })

  inputTime = this.entityMemory(Range)
  pos = this.entityMemory({ x: Number, y: Number })

  abstract draw(): void

  abstract effect: EffectClip

  preprocess() {
    super.preprocess()

    this.targetTime = bpmChanges.at(this.noteImport.Beat).time
    this.inputTime.copyFrom(this.judgementWindow.good.add(this.targetTime).add(input.offset))

    if (this.shouldSheduleSFX) this.effect.schedule(this.targetTime, 0.02)
  }

  getPos() {
    this.pos.x = toLineX(this.noteImport.Beat, this.singleNoteImport.LastPoint, this.singleNoteImport.NextPoint)
    this.pos.y = toLineY(this.noteImport.Beat, this.singleNoteImport.LastPoint, this.singleNoteImport.NextPoint)
  }

  updateParallel() {
    if (this.inputTime.max < time.now) {
      this.missEffect(this.inputTime.max, this.pos.y)
      this.result.judgment = Judgment.Miss
      this.despawn = true
    }
    this.getPos()
    if (this.pos.x < game.Xmin) return
    this.draw()
  }
}
