import { archetypes } from "."
import { skin } from "../skin"
import { canvas, judgeLineX } from "./shared"

export class Stage extends Archetype {
  shouldSpawn() {
    return entityInfos.get(0).state === EntityState.Despawned
  }


  updateSequentialOrder = 10
  updateParallel() {
    const layout = new Rect({ l: judgeLineX+0.01, r: judgeLineX-0.01, t: -1 , b: 1 })
    skin.sprites.lineRed.draw(layout, 10, 1)
  }
}
