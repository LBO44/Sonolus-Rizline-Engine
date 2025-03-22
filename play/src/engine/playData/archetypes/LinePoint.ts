import { archetypes } from "."
import { skin } from "../skin"
import { judgeLineX, lineToQuad, scaleX, scaleY, spawnBeatToTime, speed } from "./shared"

export class LinePoint extends Archetype {

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    SpawnBeat: { name: "SpawnBeat", type: Number },
    HitBeat: { name: "HitBeat", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
    YPos: { name: "YPos", type: Number },
    IsLastPoint: { name: "IsLastPoint", type: Number },
    Canvas: { name: "Canvas", type: Number },
    ColorA: { name: "ColorA", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)

  pos = this.defineSharedMemory({
    x: Number,
    y: Number
  })

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.SpawnBeat)
    this.hitTime = bpmChanges.at(this.import.HitBeat).time
    this.nextTime = archetypes.LinePoint.import.get(this.import.NextPoint).NextPoint

  }

  shouldSpawn() {
    return (this.spawnTime <= time.now)
  }

  updateSequential() {
    const n = archetypes.LinePoint.pos.get(this.import.NextPoint)
    if (n.x >= judgeLineX || (this.import.IsLastPoint && this.hitTime >= time.now)) this.despawn = true

    const debugLayout = Rect.one.mul(0.025)

    this.pos.x = scaleX(this.hitTime,this.import.Canvas)
    this.pos.y = scaleY(this.import.YPos, this.import.Canvas)

    const nx = archetypes.LinePoint.pos.get(this.import.NextPoint).x
    const ny = archetypes.LinePoint.pos.get(this.import.NextPoint).y

    const lineLayout = lineToQuad(this.pos.x, this.pos.y, nx, ny)



    if (this.import.IsLastPoint == 0 && archetypes.LinePoint.pos.get(this.import.NextPoint).x != 0) {
      skin.sprites.lineNeutral.draw(lineLayout, 3, this.import.ColorA+0.2)
      skin.sprites.judgeRingBlue.draw(debugLayout.translate(this.pos.x, this.pos.y), 2, this.import.ColorA + 0.2)
    }

    // if (time.now >= this.endTime + 3) this.despawn = true
  }
}
