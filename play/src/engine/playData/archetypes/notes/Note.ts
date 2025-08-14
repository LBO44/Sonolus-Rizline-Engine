import { archetypes } from ".."
import { options } from "../../../configuration/options"
import { particle } from "../../particle"
import { game, levelMem, spawnBeatToTime } from "../shared"

export abstract class Note extends Archetype {
  hasInput = true

  abstract bucket: Bucket

  abstract judgementWindow: {
    perfect: Range
    great: Range
    good: Range
  }

  abstract bucketWindow: JudgmentWindows

  abstract isChallenge: Boolean

  noteImport = this.defineImport({
    Beat: { name: "Beat", type: Number },
  })

  targetTime = this.entityMemory(Number)
  spawnTime = this.entityMemory(Number)

  globalPreprocess() {
    this.bucket.set(this.bucketWindow)

    //Insane diff values, from rizwiki.cn
    if (this.isChallenge) {
      const ChallengeTotalHitCount = archetypes.Initialization.import.get(0).ChallengeTotalHitCount

      this.life.set({
        perfect: 1300 / ChallengeTotalHitCount,
        great: 1100 / ChallengeTotalHitCount,
        good: -12,
        miss: -60,
      })
    } else {
      this.life.set({
        perfect: 0,
        great: 0,
        good: -12,
        miss: -60,
      })
    }
  }

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.noteImport.Beat)
  }

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  setTouchResult(time: number) {
    this.result.accuracy = time - this.targetTime
    this.result.judgment = input.judge(time, this.targetTime, this.judgementWindow)

    this.result.bucket.index = this.bucket.index
    this.result.bucket.value = this.result.accuracy * 1000
  }

  spawnParticle(y: number) {
    const particleId = levelMem.isChallenge ? particle.effects.noteChallenge.id : particle.effects.noteNormal.id

    const layout = Rect.one.mul(0.2).translate(game.XMax, y)
    particle.effects.spawn(particleId, layout, 0.5, false)
  }

  get shouldPlaySFX() {
    return options.SfxEnabled && !options.autoSfx
  }

  get shouldSheduleSFX() {
    return options.SfxEnabled && options.autoSfx
  }

  missEffect(startTime: number, y: number) {
    if (options.missEffect) archetypes.MissEffect.spawn({ startTime, yPos: y })
  }
}
