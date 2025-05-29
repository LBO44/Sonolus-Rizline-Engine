import { archetypes } from "..";
import { options } from "../../../configuration/options";
import { camera } from "../shared";
import { CameraEvent } from "./CameraEvent";

export class CameraMove extends CameraEvent {
  cameraVaraible = camera.yPos

  preprocess() {
    if (options.mirror) this.import.Value *= -1
    super.preprocess()
  }

  getNextValue() {
    this.nextTime = bpmChanges.at(archetypes.CameraMove.import.get(this.import.NextCameraEntity).Beat).time
    this.nextValue = archetypes.CameraMove.import.get(this.import.NextCameraEntity).Value
    if (options.mirror) this.nextValue *= -1 //this is because preprocess of next entity hasn't been run yet
  }
}
