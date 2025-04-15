import { CanvasEntity } from "./CanvasEvent"
import { canvas } from "../shared"
import { archetypes } from ".."

export class CanvasSpeed extends CanvasEntity {
  canvasVaraible = canvas.speed
  getNextValue = () =>  this.nextValue = archetypes.CanvasSpeed.import.get(this.import.NextCanvasEntity).Value
}
