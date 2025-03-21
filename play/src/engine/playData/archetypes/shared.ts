import { archetypes } from "."

//canvas info modified by the canvas etities
export const canvas = levelMemory({
  yPos: Tuple(16, Number),
  speed: Tuple(16, Number),
})

export const judgeLineX = 0.8
export const speed = 2.5

const lineWidth: number = 0.01

/** the judgeline is on the y axis
 * in rizline -0.5 is left and 0.5 is right edge of screen */
export const scaleY = (y: number) => y * 2

/** time to screen x based on judgeLineX, speed and point hitTime and cuurent time*/
export const scaleX = (hitTime: number) => judgeLineX + -speed * (bpmChanges.at(hitTime).time - time.now)

/** return the x of the point at y between 2 points */
export const yOnLine = (hitTime: number, lastPoint: number, nextPoint: number): number => {

  const ly = archetypes.LinePoint.pos.get(lastPoint).y
  const ny = archetypes.LinePoint.pos.get(nextPoint).y

  const lx = bpmChanges.at(archetypes.LinePoint.import.get(lastPoint).Time).time
  const nx = bpmChanges.at(archetypes.LinePoint.import.get(nextPoint).Time).time
  return ly + (bpmChanges.at(hitTime).time - lx) / (nx - lx) * (ny - ly)
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
