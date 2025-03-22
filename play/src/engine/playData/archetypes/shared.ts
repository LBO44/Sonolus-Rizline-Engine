import { archetypes } from "."
import { configuration } from "../../configuration"

//canvas info modified by the canvas etities
export const canvas = levelMemory({
  yPos: Tuple(16, Number),
  speed: Tuple(16, Number),
})

export const judgeLineX = 0.9
export const speed = configuration.options.NoteSpeed

const lineWidth: number = 0.01

export const spawnBeatToTime = (spawnBeat: number) => bpmChanges.at(spawnBeat).time - 10 / speed

/** the judgeline is on the y axis
 * in rizline -0.5 is left and 0.5 is right edge of screen */
export const scaleY = (y: number, canvasID: number) => (y + canvas.yPos.get(canvasID)) * 2

/** time to screen x based on judgeLineX, speed and point hitTime and cuurent time*/
export const scaleX = (hitTime: number, canvasID: number) => judgeLineX + -(speed * canvas.speed.get(canvasID)) * (hitTime - time.now)

/** return the y of the note at a certain time between 2 linePoints */
export const toLineY = (hitBeat: number, lastPoint: number, nextPoint: number): number => {

  const ly = archetypes.LinePoint.pos.get(lastPoint).y
  const ny = archetypes.LinePoint.pos.get(nextPoint).y

  const lt = bpmChanges.at(archetypes.LinePoint.import.get(lastPoint).HitBeat).time
  const nt = bpmChanges.at(archetypes.LinePoint.import.get(nextPoint).HitBeat).time
  return ly + (bpmChanges.at(hitBeat).time - lt) / (nt - lt) * (ny - ly)
}

/** return the x of the note at a certain time between 2 linePoints */
export const toLineX = (hitBeat: number, lastPoint: number, nextPoint: number): number => {

  const lx = archetypes.LinePoint.pos.get(lastPoint).x
  const nx = archetypes.LinePoint.pos.get(nextPoint).x

  const lt = bpmChanges.at(archetypes.LinePoint.import.get(lastPoint).HitBeat).time
  const nt = bpmChanges.at(archetypes.LinePoint.import.get(nextPoint).HitBeat).time
  return lx + (bpmChanges.at(hitBeat).time - lt) / (nt - lt) * (nx - lx)
}

export const lineToQuad = (lx: number, ly: number, nx: number, ny: number,): Quad => {
  // Calculate direction vector
  const dx = nx - lx;
  const dy = ny - ly;

  // Calculate perpendicular vector
  const perpX = -dy;
  const perpY = dx;
  const length = Math.hypot(perpX, perpY);

  // Scale to line width
  const offsetX = (perpX / length) * (lineWidth / 2)
  const offsetY = (perpY / length) * (lineWidth / 2)

  return new Quad({
    x1: lx + offsetX, y1: ly + offsetY,
    x2: lx - offsetX, y2: ly - offsetY,
    x3: nx - offsetX, y3: ny - offsetY,
    x4: nx + offsetX, y4: ny + offsetY,
  })
}
