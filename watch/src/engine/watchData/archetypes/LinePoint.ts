import { drawCurvedLine, ease, game, lineToQuad, preemptTime } from "../../../../../shared/src/utilities.js"
import { configuration } from "../../configuration"
import { skin } from "../skin"
import { camera, canvasPos } from "./easeEvents.js"

export class LinePoint extends Archetype {

  import = this.defineImport({
    Line: { name: "Line", type: Number },
    SpawnBeat: { name: "SpawnBeat", type: Number }, // when previous entity hit judge line
    HitBeat: { name: "HitBeat", type: Number }, // when this entity hit judge line
    NextPoint: { name: "NextPoint", type: Number },
    YPos: { name: "YPos", type: Number },
    IsLastPoint: { name: "IsLastPoint", type: Number },
    Canvas: { name: "Canvas", type: Number },
    EaseType: { name: "EaseType", type: Number },
    Alpha: { name: "Alpha", type: Number },
    ColorIndex: { name: "ColorIndex", type: SkinSpriteId },
  })


  data = this.defineImport({
    targetTime: { name: "", type: Number },
    visualStartTime: { name: "", type: Number },
    visualEndTime: { name: "", type: Number },
  })


  timeToCanvasTime(canvasId: number, time: number) {
    return time //TODO
  }

  getVisualStartTime(canvasId: number, targetTime: number): number {
    return targetTime - (game.distance / (configuration.options.speed * 0.25))
  }

  getPos(ref: number) {
    const data = this.data.get(ref)
    const x = Math.lerp(game.XStart, game.XEnd, Math.unlerp(data.visualStartTime, data.targetTime, time.now))
    const y = 2 * (this.import.get(ref).YPos + canvasPos.get(this.import.Canvas) - camera.pos)
    return { x, y }
  }

  get pos() {
    return this.getPos(this.info.index)
  }

  get nextPos() {
    return this.getPos(this.import.NextPoint)
  }

  get nextImport() {
    return this.import.get(this.import.NextPoint)
  }

  preprocess() {
    this.data.targetTime = bpmChanges.at(this.import.HitBeat).time
    this.data.visualStartTime = this.getVisualStartTime(this.import.Canvas, this.data.targetTime)

    this.data.visualEndTime = this.import.IsLastPoint ? this.data.targetTime : bpmChanges.at(this.nextImport.HitBeat).time
  }

  spawnTime() {
    return this.data.visualStartTime
  }

  despawnTime() {
    return this.data.visualEndTime
  }


  drawLineToNextPoint(pos: { x: number, y: number }, nextPos: { x: number, y: number }) {
    const alpha = this.import.Alpha
    const spriteId = skin.sprites.line0.id + Math.min(31, this.import.ColorIndex + 1) as SkinSpriteId

    if (pos.x === nextPos.x) {
      const lineLayout = lineToQuad(pos.x, pos.y, nextPos.x, nextPos.y)
      skin.sprites.draw(spriteId, lineLayout, 3, alpha)
    }

    else {
      // vertical lines also need fade out, drawCurvedLine can't handle horizontal lines
      drawCurvedLine(pos.x, pos.y, nextPos.x, nextPos.y, this.import.EaseType, spriteId, alpha)
    }

  }

  yAtJudgeLine(pos: { x: number, y: number }, nextPos: { x: number, y: number }): number {
    const t = Math.clamp((game.XEnd - pos.x) / (nextPos.x - pos.x), 0, 1)
    const e = ease(t, this.import.EaseType)
    return Math.lerp(pos.y, nextPos.y, e)
  }

  drawJudgeRing(y: number) {
    const layout = Rect.one.mul(0.1).translate(game.XEnd, y)
    skin.sprites.judgeRing0.draw(layout, 10000 + this.info.index, 1)
  }

  render() {

    let pos = this.pos
    let nextPos = this.nextPos //caching it else it adds a minute of compile time :slain:

    skin.sprites.noteTapNormal.draw(
      Rect.one.mul(0.04).translate(pos.x, pos.y), 999, 1)
    this.drawLineToNextPoint(pos, nextPos)

    // if (pos.x > game.XEnd) this.drawJudgeRing(this.yAtJudgeLine(pos, nextPos))
  }

  updateSequential() {
    this.render()
  }


}
