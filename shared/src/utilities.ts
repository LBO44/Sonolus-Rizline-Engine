import { RizEaseType } from "../../lib/chart_converter"
import { skin } from "../../watch/src/engine/watchData/skin"
import { optionsDefinition } from "./engine/configuration/options"
import { configuration } from "../../play/src/engine/configuration"

export const ease = (t: number, easeType: number): number => {
  switch (easeType) {
    case RizEaseType.Linear: return t
    case RizEaseType.InQuad: return Math.ease("In", "Quad", t)
    case RizEaseType.OutQuad: return Math.ease("Out", "Quad", t)
    case RizEaseType.InOutQuad: return Math.ease("InOut", "Quad", t)
    case RizEaseType.InCubic: return Math.ease("In", "Cubic", t)
    case RizEaseType.OutCubic: return Math.ease("Out", "Cubic", t)
    case RizEaseType.InOutCubic: return Math.ease("InOut", "Cubic", t)
    case RizEaseType.InQuart: return Math.ease("In", "Quart", t)
    case RizEaseType.OutQuart: return Math.ease("Out", "Quart", t)
    case RizEaseType.InOutQuart: return Math.ease("InOut", "Quart", t)
    case RizEaseType.InQuint: return Math.ease("In", "Quint", t)
    case RizEaseType.OutQuint: return Math.ease("Out", "Quint", t)
    case RizEaseType.InOutQuint: return Math.ease("InOut", "Quint", t)
    case RizEaseType.Zero: return 0
    case RizEaseType.One: return 1
    case RizEaseType.InCirc: return Math.ease("In", "Circ", t)
    case RizEaseType.OutCirc: return Math.ease("Out", "Circ", t)
    case RizEaseType.OutSine: return Math.ease("Out", "Sine", t)
    case RizEaseType.InSine: return Math.ease("In", "Sine", t)
    default: return t
  }
}

export const game = {
  XStart: -1.5,
  XEnd: 0.9,
  distance: 0.24,
}

export const preemptTime = () => {
  return Math.lerp(2.4, 0.2, Math.unlerp(optionsDefinition.noteSpeed.min, optionsDefinition.noteSpeed.max, configuration.options.noteSpeed))
}


export const scaleY = (y: number, canvasID: number) => (y + 0 - 0) * 2


export const lineToQuad = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): Quad => {
  const dx = endX - startX
  const dy = endY - startY
  const lineWidth = 0.01

  // Calculate normalized perpendicular direction
  const len = Math.hypot(dx, dy)
  const nx = (-dy / len) * lineWidth
  const ny = (dx / len) * lineWidth

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
  spriteId: SkinSpriteId,
  alpha: number
) {

  const dx = endX - startX

  // Compute t‑range 
  const r0 = (game.XEnd - startX) / dx
  const r1 = (game.XStart - startX) / dx

  const t0 = Math.clamp(r0, 0, 1)
  const t1 = Math.clamp(r1, 0, 1)
  if (t0 >= t1) return  // nothing to draw

  const segments = 32 //(easeType === 0) ? 1 : 32

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

    const dist = Math.min(game.XEnd - xA, xB - game.XStart)
    const fade = Math.remapClamped(0, 0.2, 0, 1, dist)

    const a = alpha * fade

    const quad = lineToQuad(xA, yA, xB, yB)
    skin.sprites.draw(spriteId, quad, 4 + spriteId, a)

  }
}


