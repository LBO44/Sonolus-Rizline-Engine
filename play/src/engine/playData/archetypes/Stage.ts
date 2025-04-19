import { archetypes } from "."
import { skin } from "../skin"
import { game } from "./shared"

export class Stage extends Archetype {
  shouldSpawn() {
    return entityInfos.get(0).state === EntityState.Despawned
  }


  updateSequentialOrder = 10
  updateParallel() {
    const layout = new Rect({ l: game.XMax+0.01, r: game.XMax-0.01, t: -1 , b: 1 })
    skin.sprites.lineRed.draw(layout, 10, 1)
  }
}
