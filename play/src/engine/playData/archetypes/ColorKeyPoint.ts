import { archetypes } from "."
import { spawnBeatToTime } from "./shared"

abstract class ColorKeyPoint extends Archetype {

  abstract setColors(): void
  abstract updateAlphas(t: number): void

  import = this.defineImport({
    //hit and spawn should be the same, except for the first colour point which will have the same spawn time as the line first point
    HitBeat: { name: "HitBeat", type: Number },
    SpawnBeat: { name: "SpawnBeat", type: Number },
    NextPoint: { name: "NextPoint", type: Number },
    Line: { name: "Line", type: Number },
    ColorIndex: { name: "ColorIndex", type: SkinSpriteId },
    Alpha: { name: "Alpha", type: Number }
  })

  spawnTime = this.entityMemory(Number)
  hitTime = this.entityMemory(Number)
  nextTime = this.entityMemory(Number)
  nextA = this.entityMemory(Number)

  preprocess() {
    this.spawnTime = spawnBeatToTime(this.import.SpawnBeat)
    this.hitTime = bpmChanges.at(this.import.HitBeat).time
    this.nextTime = bpmChanges.at(archetypes.JudgeRingColorKeyPoint.import.get(this.import.NextPoint).HitBeat).time
    this.nextA = this.import.NextPoint == 0 ? this.import.Alpha : this.import.get(this.import.NextPoint).Alpha
  }

  spawnOrder() {
    return 1000 + this.spawnTime
  }

  shouldSpawn() {
    return time.now >= this.spawnTime
  }


  updateSequential() {
    if (time.now >= this.nextTime) this.despawn = true
    const t = this.import.Alpha == this.nextA ? this.import.Alpha : Math.remapClamped(this.hitTime, this.nextTime, this.import.Alpha, this.nextA, time.now)
    this.updateAlphas(t)
    this.setColors()
  }

}

export class JudgeRingColorKeyPoint extends ColorKeyPoint {

  setColors() {
    archetypes.Line.color.get(this.import.Line).judgeRing.colorIndexA = this.import.ColorIndex
    archetypes.Line.color.get(this.import.Line).judgeRing.colorIndexB = archetypes.JudgeRingColorKeyPoint.import.get(this.import.NextPoint).ColorIndex
  }

  updateAlphas(t: number) {
    archetypes.Line.color.get(this.import.Line).judgeRing.alphaA = t
    archetypes.Line.color.get(this.import.Line).judgeRing.alphaB = this.nextA - t
  }
}

export class LineColorKeyPoint extends ColorKeyPoint {
  setColors() {
    archetypes.Line.color.get(this.import.Line).line.colorIndexA = this.import.ColorIndex
    archetypes.Line.color.get(this.import.Line).line.colorIndexB = archetypes.LineColorKeyPoint.import.get(this.import.NextPoint).ColorIndex
  }

  updateAlphas(t: number) {
    archetypes.Line.color.get(this.import.Line).line.alphaA = t
    archetypes.Line.color.get(this.import.Line).line.alphaB = this.nextA - t
  }

}
