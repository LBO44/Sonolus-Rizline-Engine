import { options } from "../../../configuration/options"
import { camera } from "../shared"
import { easeEvent } from "./EaseEvent"

export class CameraMove extends easeEvent {

  preprocess() {
    if (options.mirror) this.import.Value *= -1
    super.preprocess()
    if (options.mirror) this.nextValue *= -1
  }

  setVariable(value: number) {
    camera.yPos = value
  }
}
