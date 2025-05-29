import { archetypes } from "."
import { options } from "../../configuration/options"
import { skin } from "../skin"
import { drawCurvedLine, ease, game, lineToQuad, scaleX, scaleY, spawnBeatToTime } from "./shared"

export class LinePoint extends Archetype {

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    SpawnBeat: { name: "SpawnBeat", type: Number },
    HitBeat: { name: "HitBeat", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
    YPos: { name: "YPos", type: Number },
    IsLastPoint: { name: "IsLastPoint", type: Number },
    Canvas: { name: "Canvas", type: Number },
    EaseType: { name: "EaseType", type: Number },
    Alpha: { name: "Alpha", type: Number },
    ColorIndex: { name: "ColorIndex", type: Number },
  })

  spawnTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  nextA = this.entityMemory(Number)

  lineY = this.entityMemory(Number)

  pos = this.defineSharedMemory({
    x: Number,
    y: Number,
    test: Number
  })

  preprocess() {
    if (options.mirror) this.import.YPos *= -1
    this.spawnTime = this.import.SpawnBeat == 0 ? spawnBeatToTime(this.import.HitBeat) : spawnBeatToTime(this.import.SpawnBeat)
    this.hitTime = bpmChanges.at(this.import.HitBeat).time
    this.nextTime = archetypes.LinePoint.import.get(this.import.NextPoint).NextPoint
    this.nextA = archetypes.LinePoint.import.get(this.import.NextPoint).Alpha
  }

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  shouldSpawn() {
    return this.spawnTime <= time.now
  }
  updateSequentialOrder = 10

  updateSequential() {
    this.pos.x = scaleX(this.hitTime, this.import.Canvas)
    this.pos.y = scaleY(this.import.YPos, this.import.Canvas)
    this.lineY = this.updateLineYPos()
  }


  drawLineToNextPoint() {
    const n = archetypes.LinePoint.pos.get(this.import.NextPoint)

    const lineColor = archetypes.Line.color.get(this.import.Line)
    const colorID = (this.import.Alpha < 0) ? this.import.ColorIndex : lineColor.line.colorIndex
    const alpha = (this.import.Alpha > 0) ? this.import.Alpha : lineColor.line.alpha

    const spriteId = skin.sprites.line0.id + Math.min(31, colorID) as SkinSpriteId

    if (this.pos.x === n.x) {
      const lineLayout = lineToQuad(this.pos.x, this.pos.y, n.x, n.y)
      skin.sprites.draw(spriteId, lineLayout, 3, this.nextA)
    }
    else if (this.pos.y === n.y) {
      const lineLayout = lineToQuad(Math.min(this.pos.x, game.XMax), this.pos.y, Math.max(game.Xmin, n.x), n.y)
      skin.sprites.draw(spriteId, lineLayout, 3, this.nextA)
    }
    else {
      drawCurvedLine(this.pos.x, this.pos.y, n.x, n.y, this.import.EaseType, spriteId, alpha)
    }
  }

  drawJudgeRing(lineY: number) {
    const lineColor = archetypes.Line.color.get(this.import.Line)
    const alpha = (entityInfos.get(this.import.Line).state == 1) ? lineColor.judgeRing.alpha : 1
    const layout = Rect.one.mul(0.1)
      .translate(game.XMax, lineY)
    const spriteId = skin.sprites.judgeRing0.id + Math.min(31, lineColor.judgeRing.colorIndex) as SkinSpriteId
    skin.sprites.draw(spriteId, layout, 100, alpha)
  }

  updateLineYPos(): number {
    const n = archetypes.LinePoint.pos.get(this.import.NextPoint)
    const t = Math.clamp((game.XMax - this.pos.x) / (n.x - this.pos.x), 0, 1)
    const e = ease(t, this.import.EaseType)
    const y = /**(this.pos.x === n.x) ? this.pos.y :*/ this.pos.y + e * (n.y - this.pos.y)
    archetypes.Line.pos.get(this.import.Line).y = y
    return y
  }

  updateParallel() {
    const n = archetypes.LinePoint.pos.get(this.import.NextPoint)

    if ((n.x > game.XMax && !this.import.IsLastPoint) || (this.import.IsLastPoint && this.hitTime < time.now)) this.despawn = true
    if (n.x === 0 || this.import.IsLastPoint === 1) return

    if (this.pos.x > game.Xmin) this.drawLineToNextPoint()

    if (this.pos.x >= game.XMax) this.drawJudgeRing(this.lineY)
  }
}
