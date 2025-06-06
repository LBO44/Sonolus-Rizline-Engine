import { canvas } from "../shared"
import { easeEvent } from "./EaseEvent"

export class CanvasSpeed extends easeEvent {

  importCanvas = this.defineImport({
    id: { name: "Canvas", type: Number },
  })

  setVariable(value: number) {
    canvas.speed.set(this.importCanvas.id, value)
  }
}
