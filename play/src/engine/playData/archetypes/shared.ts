import { archetypes } from "."
import { configuration } from "../../configuration"
import { skin } from "../skin"

//canvas info modified by the canvas etities
export const canvas = levelMemory({
  yPos: Tuple(16, Number),
  speed: Tuple(16, Number),
})

export const camera = levelMemory({
  yPos: Number,
  scale: Number
})

// export const judgementWindow = {
//   hit: Range.one.mul(0.045),
//   early: new Range({ min: -90, max: -45 }),
//   late: new Range({ min: 45, max: 90 }),
//   bad: new Range({ min: -95, max: 90 })
// }

export const judgementWindow = {
  perfect: Range.one.mul(0.045),
  great: Range.one.mul(0.09),
  good: Range.one.mul(0.09)
}

export const judgeLineX = 0.9
export const XMin = -1.5

export const speed = configuration.options.NoteSpeed

const lineWidth: number = 0.01

export const ease = (t: number, easeType: number): number => {
  switch (easeType) {
    case 0: return t
    case 1: return Math.ease("In", "Sine", t)
    case 2: return Math.ease("Out", "Sine", t)
    case 3: return Math.ease("InOut", "Sine", t)
    case 4: return Math.ease("In", "Quad", t)
    case 5: return Math.ease("Out", "Quad", t)
    case 6: return Math.ease("InOut", "Quad", t)
    case 7: return Math.ease("In", "Cubic", t)
    case 8: return Math.ease("Out", "Cubic", t)
    case 9: return Math.ease("InOut", "Cubic", t)
    case 10: return Math.ease("In", "Quart", t)
    case 11: return Math.ease("Out", "Quart", t)
    case 12: return Math.ease("InOut", "Quart", t)
    case 13: return 0
    case 14: return 1
    default: return t
  }
}

export const easeValue = (v1: number, v2: number, easeType: number, x: number, x1: number, x2: number): number => {
  const t = Math.remapClamped(x1, x2, 0, 1, x)
  return Math.lerpClamped(v1, v2, ease(t, easeType))
}


export const spawnBeatToTime = (spawnBeat: number) => bpmChanges.at(spawnBeat).time - 10 / speed

/** the judgeline is on the y axis
 * in rizline -0.5 is left and 0.5 is right edge of screen */
export const scaleY = (y: number, canvasID: number) => (y + canvas.yPos.get(canvasID) + camera.yPos) * 2

/** time to screen x based on judgeLineX, speed and point hitTime and cuurent time*/
export const scaleX = (hitTime: number, canvasID: number) => judgeLineX - (speed * canvas.speed.get(canvasID)) * (hitTime - time.now)

/** return the y of the note at a certain time between 2 linePoints */
export const toLineY = (hitBeat: number, lastPoint: number, nextPoint: number): number => {
  const ly = archetypes.LinePoint.pos.get(lastPoint).y
  const ny = archetypes.LinePoint.pos.get(nextPoint).y

  const lt = bpmChanges.at(archetypes.LinePoint.import.get(lastPoint).HitBeat).time
  const nt = bpmChanges.at(archetypes.LinePoint.import.get(nextPoint).HitBeat).time

  const tRaw = bpmChanges.at(hitBeat).time

  const t = Math.clamp((tRaw - lt) / (nt - lt), 0, 1)

  const easeType = archetypes.LinePoint.import.get(lastPoint).EaseType

  const e = ease(t, easeType)
  return ly + e * (ny - ly)
}

/** return the x of the note at a certain time between 2 linePoints */
export const toLineX = (hitBeat: number, lastPoint: number, nextPoint: number): number => {

  const lx = archetypes.LinePoint.pos.get(lastPoint).x
  const nx = archetypes.LinePoint.pos.get(nextPoint).x

  const lt = bpmChanges.at(archetypes.LinePoint.import.get(lastPoint).HitBeat).time
  const nt = bpmChanges.at(archetypes.LinePoint.import.get(nextPoint).HitBeat).time
  return lx + (bpmChanges.at(hitBeat).time - lt) / (nt - lt) * (nx - lx)
}

export const lineToQuad = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): Quad => {
  const dx = endX - startX
  const dy = endY - startY
  const hw = lineWidth / 2

  // Calculate normalized perpendicular direction
  const len = Math.hypot(dx, dy)
  const nx = (-dy / len) * hw
  const ny = (dx / len) * hw

  return new Quad({
    x1: startX + nx, y1: startY + ny,
    x2: startX - nx, y2: startY - ny,
    x3: endX - nx, y3: endY - ny,
    x4: endX + nx, y4: endY + ny
  })
}

export function drawCurvedLine(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  easeType: number,
  alpha: number
) {
  const clipXMax = XMin
  const clipXMin = judgeLineX

  const dx = endX - startX

  // Compute t‑range 
  let t0 = (clipXMin - startX) / dx
  let t1 = (clipXMax - startX) / dx
  t0 = Math.max(0, Math.min(1, t0))
  t1 = Math.max(0, Math.min(1, t1))
  if (t0 >= t1) return  // nothing to draw

  const segments = (easeType === 0) ? 1 : 32

  for (let i = 0; i < segments; i++) {
    // fraction along the CLIPPED span
    const u0 = i / segments
    const u1 = (i + 1) / segments

    // map into [t0, t1]
    const ta = t0 + (t1 - t0) * u0
    const tb = t0 + (t1 - t0) * u1

    // eased Y‐fractions
    const ea = ease(ta, easeType)
    const eb = ease(tb, easeType)

    // actual points
    const xA = startX + dx * ta
    const xB = startX + dx * tb
    const yA = startY + (endY - startY) * ea
    const yB = startY + (endY - startY) * eb

    const quad = lineToQuad(xA, yA, xB, yB)
    skin.sprites.lineGreen.draw(quad, 4, alpha)

  }
}
