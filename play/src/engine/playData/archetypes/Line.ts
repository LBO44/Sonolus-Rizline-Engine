import { skin } from "../skin"
import { speed } from "./shared"

export class Line extends Archetype {

  import = this.defineImport({
    StartTime: { name: "StartTime", type: Number },
    EndTime:{name: "EndTime", type:Number},
    FirstPoint: { name: "FirstPoint", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  skinID = this.entityMemory(SkinSpriteId)

  sharedMemory = this.defineSharedMemory({
  })


  preprocess() {

    this.spawnTime = bpmChanges.at(this.import.StartTime).time - 10/speed
    this.skinID = skin.sprites.lineNeutral.id 
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }

  updateSequential() {

    const lineLayout = new Rect({ b: 0, t: 2, l: -0.025, r: 0.025 })

    const JudgeLayout = Rect.one.mul(0.05)

  }
}
