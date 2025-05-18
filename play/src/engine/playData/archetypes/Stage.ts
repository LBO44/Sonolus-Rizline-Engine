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
    if (levelMem.isChallenge)
      skin.sprites.backgroundChallenge.draw(screen.rect, 1, 1)
    else
      skin.sprites.backgroundNormal.draw(screen.rect, 1, 1)
  }
}
