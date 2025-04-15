import { CanvasEntity } from "./CanvasEvent"
import { canvas } from "../shared"
import { archetypes } from ".."

export class CanvasMove extends CanvasEntity {
  canvasVaraible = canvas.yPos
  getNextValue = () =>  this.nextValue = archetypes.CanvasMove.import.get(this.import.NextCanvasEntity).Value
}
