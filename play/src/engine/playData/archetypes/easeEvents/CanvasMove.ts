import { options } from "../../../configuration/options"
import { canvas } from "../shared"
import { easeEvent } from "./EaseEvent"

export class CanvasMove extends easeEvent {

  importCanvas = this.defineImport({
    id: { name: "Canvas", type: Number },
  })

  preprocess() {
    if (options.mirror) this.import.Value *= -1
    super.preprocess()
    if (options.mirror) this.nextValue *= -1
  }

  setVariable(value: number) {
    canvas.yPos.set(this.importCanvas.id, value)
  }
}
