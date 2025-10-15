import { configuration } from "../../../../../play/src/engine/configuration"
import { skin } from "../skin"

export class Stage extends Archetype {
    spawnTime() {
        return -999999
    }

    despawnTime() {
        return 999999
    }

    updateSequential() {
    }

    preprocess() {
    }

    updateParallel() {
        const a = configuration.options.backgroundOpacity

        if (a === 0) return

        skin.sprites.backgroundNormal.draw(screen.rect, 1, a)
    }
}
