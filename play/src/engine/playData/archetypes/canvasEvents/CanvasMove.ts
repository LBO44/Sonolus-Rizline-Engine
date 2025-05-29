import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { canvas } from "../shared"
import { CanvasEntity } from "./CanvasEvent"

export class CanvasMove extends CanvasEntity {
  canvasVaraible = canvas.yPos

  preprocess() {
    if (options.mirror) this.import.Value *= -1
    super.preprocess()
  }

  getNextValue = () => {
    this.nextValue = archetypes.CanvasMove.import.get(this.import.NextCanvasEntity).Value
    this.nextTime = bpmChanges.at(archetypes.CanvasMove.import.get(this.import.NextCanvasEntity).Beat).time
    if (options.mirror) this.nextValue *= -1 //this is because preprocess of next entity hasn't been run yet
  }
}
