import { archetypes } from "."
import { configuration } from "../../configuration"

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

export const ease = (v1: number, v2: number, easeType: number, x: number, x1: number, x2: number): number => {
  const t = Math.remapClamped(x1, x2, 0, 1, x)
  let a = 0
  switch (easeType) {
    case 0: a = t; break
    case 1: a = Math.ease("In", "Sine", t); break
    case 2: a = Math.ease("Out", "Sine", t); break
    case 3: a = Math.ease("InOut", "Sine", t); break
    case 4: a = Math.ease("In", "Quad", t); break
    case 5: a = Math.ease("Out", "Quad", t); break
    case 6: a = Math.ease("InOut", "Quad", t); break
    case 7: a = Math.ease("In", "Cubic", t); break
    case 8: a = Math.ease("Out", "Cubic", t); break
    case 9: a = Math.ease("InOut", "Cubic", t); break
    case 10: a = Math.ease("In", "Quart", t); break
    case 11: a = Math.ease("Out", "Quart", t); break
    case 12: a = Math.ease("InOut", "Quart", t); break
    case 13: a = 0; break
    case 14: a = 1; break
  }
  return Math.lerpClamped(v1, v2, a)
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

export const lineToQuad2 = (lx: number, ly: number, nx: number, ny: number,): Quad => {
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

export const lineToQuad = (
  lx: number,
  ly: number,
  nx: number,
  ny: number,
): Quad => {

  // --- Clipping Logic ---
  let t0 = 0;
  let t1 = 1;
  const dx = nx - lx;
  const dy = ny - ly;

  // Clip against xMin and xMax
  if (dx !== 0) {
    // Calculate t where x = xMin and x = xMax
    let tXMin = (XMin - lx) / dx;
    let tXMax = (judgeLineX - lx) / dx;

    // Swap if dx is negative
    if (dx > 0) {
      t0 = Math.max(t0, tXMin);
      t1 = Math.min(t1, tXMax);
    } else {
      t0 = Math.max(t0, tXMax);
      t1 = Math.min(t1, tXMin);
    }
  }


  // Calculate clipped line segment
  const clippedLx = lx + t0 * dx;
  const clippedLy = ly + t0 * dy;
  const clippedNx = lx + t1 * dx;
  const clippedNy = ly + t1 * dy;

  // --- Quad Generation for Clipped Segment ---
  const clippedDx = clippedNx - clippedLx;
  const clippedDy = clippedNy - clippedLy;

  // Calculate perpendicular offset
  const perpX = -clippedDy;
  const perpY = clippedDx;
  const length = Math.hypot(perpX, perpY);
  const offsetX = (perpX / length) * (lineWidth / 2);
  const offsetY = (perpY / length) * (lineWidth / 2);

  return new Quad({
    x1: clippedLx + offsetX, y1: clippedLy + offsetY,
    x2: clippedLx - offsetX, y2: clippedLy - offsetY,
    x3: clippedNx - offsetX, y3: clippedNy - offsetY,
    x4: clippedNx + offsetX, y4: clippedNy + offsetY,
  });


};
