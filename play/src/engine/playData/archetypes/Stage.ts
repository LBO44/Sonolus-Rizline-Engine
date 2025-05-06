import { skin } from "../skin"
import { levelMem, } from "./shared"

export class Stage extends Archetype {

  shouldSpawn() {
    return true
  }

  updateParallel() {
    if (levelMem.isChallenge)
      skin.sprites.backgroundChallenge.draw(screen.rect, 1, 1)
    else
      skin.sprites.backgroundNormal.draw(screen.rect, 1, 1)
  }
}
