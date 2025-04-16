import { archetypes } from "..";
import { camera } from "../shared";
import { CameraEvent } from "./CameraEvent";

export class CameraMove extends CameraEvent {
  cameraVaraible = camera.yPos
  getNextValue() {
    this.nextTime = bpmChanges.at(archetypes.CameraMove.import.get(this.import.NextCameraEntity).Beat).time
    this.nextValue = archetypes.CameraMove.import.get(this.import.NextCameraEntity).Value
  }
}
