import { options } from "../../configuration/options"
import { skin } from "../skin"
import { levelMem, } from "./shared"

export class Stage extends Archetype {

  spawnOrder() {
    return 1
  }

  shouldSpawn() {
    return entityInfos.get(0).state === EntityState.Despawned
  }

  updateParallel() {
    const a = options.backgroundOpacity

    if (a === 0) return

    if (levelMem.isChallenge)
      skin.sprites.backgroundChallenge.draw(screen.rect, 1, a)
    else
      skin.sprites.backgroundNormal.draw(screen.rect, 1, a)
  }
}
