import { skin } from "../skin"

export class MissEffect extends SpawnableArchetype({
  startTime: Number,
  yPos: Number,
}) {

  endTime = this.entityMemory(Number)

  layout = this.entityMemory(Rect)

  initialize() {
    this.endTime = this.spawnData.startTime + 0.3

    new Rect({
      l: screen.l,
      r: screen.r,
      b: this.spawnData.yPos - 0.1,
      t: this.spawnData.yPos + 0.1,
    }).copyTo(this.layout)
  }

  updateParallel() {
    if (time.now >= this.endTime) {
      this.despawn = true
      return
    }

    const a = Math.remap(this.spawnData.startTime,this.endTime,0.3,0,time.now)
    skin.sprites.line0.draw(this.layout, 1000, a)
  }

}
