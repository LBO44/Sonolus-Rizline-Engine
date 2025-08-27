
/** Only used to store line data in shared memory, never spawn*/
export class Line extends Archetype {

  color = this.defineSharedMemory({
    line: {
      colorIndexA: SkinSpriteId,
      colorIndexB: SkinSpriteId,
      alphaA: Number,
      alphaB: Number,
    },
    judgeRing: {
      colorIndexA: SkinSpriteId,
      colorIndexB: SkinSpriteId,
      alphaA: Number,
      alphaB: Number,
    }
  })

  pos = this.defineSharedMemory({
    y: Number
  })

  spawnOrder() {
    return Number.MAX_SAFE_INTEGER
  }

  preprocessOrder = 0
  preprocess() {
    this.color.judgeRing.alphaA = 1 //ehh not sure
    this.color.judgeRing.alphaB = 0 //ehh not sure
    // this.color.line.alpha = 1
  }

}
