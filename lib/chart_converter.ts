import { EngineArchetypeDataName, EngineArchetypeName, LevelData, LevelDataEntity, } from "@sonolus/core"

//Rizline chart object type,(doesn't include some stuff not needed by the engine) thanks to https://rgwiki.stary.pc.pl/wiki/Rizline:Chart_file
//All rizline `Time` are in beats
export enum RizEaseType {
  "Linear",
  "InQuad",
  "OutQuad",
  "InOutQuad",
  "InCubic",
  "OutCubic",
  "InOutCubic",
  "InQuart",
  "OutQuart",
  "InOutQuart",
  "InQuint",
  "OutQuint",
  "InOutQuint",
  "Zero",
  "One",
  "InCirc",
  "OutCirc",
  "OutSine",
  "InSine"
}

type RizKeyPoint = {
  time: number
  value: number
  easeType: RizEaseType
}

type RizColor = {
  r: number
  g: number
  b: number
  a: number
}

type RizColorKeyPoint = {
  startColor: RizColor
  endColor: RizColor //end color = start color of the next point; last point has same color for both
  time: number //start time
}

export enum RizNoteType {
  Tap,
  Drag,
  Hold,
}

export type RizColorList = [
  background: RizColor,
  note: RizColor,
  particle: RizColor
]

export type RizThemes = [
  normal: { colorsList: RizColorList },
  challenge: { colorsList: RizColorList },
]

type RizNoteOtherInformations = [
  holdEnd: number,
  holdDuration: number,
  HoldEndTimeInSeconds: number,
]

export type RizChart = {
  fileVersion: 0
  songsName?: string
  themes: RizThemes
  offset?: number //should always be 0
  bPM: number
  bpmShifts: RizKeyPoint[]
  challengeTimes: {
    start: number
    end: number
    transTime: number
  }[]
  lines: {
    linePoints: {
      time: number
      xPosition: number
      canvasIndex: number
      easeType: number
      color: RizColor
    }[]
    notes: { type: RizNoteType; time: number; otherInformations: RizNoteOtherInformations }[]
    judgeRingColor: RizColorKeyPoint[] //first point can be way before or after the first line point
    lineColor: RizColorKeyPoint[]
  }[]
  canvasMoves: {
    index: number
    xPositionKeyPoints: RizKeyPoint[]
    speedKeyPoints: RizKeyPoint[]
  }[]
  cameraMove: {
    scaleKeyPoints: RizKeyPoint[]
    xPositionKeyPoints: RizKeyPoint[]
  }
}

export const hexColor = (color: RizColor): string => {
  const toHex = (value: number) => value.toString(16).padStart(2, "0")
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}

//LevelDataEntity generator functions
const BpmChangeEntity = (beat: number, bpm: number): LevelDataEntity => {
  return {
    archetype: EngineArchetypeName.BpmChange,
    data: [
      { name: EngineArchetypeDataName.Beat, value: beat },
      { name: EngineArchetypeDataName.Bpm, value: bpm },
    ],
  }
}

const ChallengeEntity = (beat: number, type: "Start" | "End"): LevelDataEntity => {
  return {
    archetype: `Challenge${type}`,
    data: [{ name: "Beat", value: beat }],
  }
}

//line entity only handles storing the line color
const LineEntity = (line: number): LevelDataEntity => {
  return {
    name: `Line${line}`,
    archetype: "Line",
    data: [],
  }
}

const LinePointEntity = (
  hitBeat: number, //when the point is supposed to reach tye judgement line
  spawnBeat: number, //hitBeat of the previous point
  pointIndex: number,
  line: number,
  canvas: number,
  yPos: number,
  easeType: number,
  colorIndex: number,
  alpha: number,
  isLastPoint = false,
): LevelDataEntity => {
  return {
    name: `Line${line}-Point${pointIndex}`,
    archetype: "LinePoint",
    data: [
      { name: "HitBeat", value: hitBeat },
      { name: "SpawnBeat", value: spawnBeat },
      { name: "Line", ref: `Line${line}` },
      { name: "NextPoint", ref: `Line${line}-Point${pointIndex + 1}` }, //this value will be incorrect if last point
      { name: "YPos", value: yPos }, //renamed x pos to y pos as rizline x corresponds to sonolus y
      { name: "IsLastPoint", value: +isLastPoint },
      { name: "Canvas", value: canvas },
      { name: "EaseType", value: easeType },
      { name: "ColorIndex", value: colorIndex },
      { name: "Alpha", value: alpha / 255 },
    ],
  }
}

const ColorKeyPoint = (
  hitBeat: number,
  spawnBeat: number,
  type: "JudgeRing" | "Line",
  line: number,
  pointIndex: number,
  startColorIndex: number,
  startAlpha: number,
): LevelDataEntity => {
  return {
    archetype: `${type}ColorKeyPoint`,
    name: `Line${line}-${type}ColorKeyPoint${pointIndex}`,
    data: [
      { name: "HitBeat", value: hitBeat },
      { name: "SpawnBeat", value: spawnBeat },
      { name: "Line", ref: `Line${line}` },
      { name: "ColorIndex", value: startColorIndex },
      { name: "Alpha", value: startAlpha / 255 },
      { name: "NextPoint", ref: `Line${line}-${type}ColorKeyPoint${pointIndex + 1}` }, //this value will be incorrect if last point
    ],
  }
}

const NoteEntity = (
  beat: number,
  line: number,
  LastPoint: number,
  type: RizNoteType,
  isChallenge: Boolean,
  noteId: number,
  isDoubleNote: boolean,
  partnerNoteId?: number,
): LevelDataEntity => {
  return {
    archetype: `${isChallenge ? "Challenge" : "Normal"}${RizNoteType[type]}Note`,
    ...(type == RizNoteType.Hold || isDoubleNote ? { name: `Note ${noteId}` } : {}),
    data: [
      { name: "Beat", value: beat },
      { name: "LastPoint", ref: `Line${line}-Point${LastPoint}` },
      { name: "NextPoint", ref: `Line${line}-Point${LastPoint + 1}` },
      { name: "IsDoubleNote", value: +isDoubleNote },
      ...(type == RizNoteType.Hold ? [{ name: "HoldEnd", ref: `Hold Note End ${noteId}` }] : []),
      ...(isDoubleNote ? [{ name: "PartnerNote", ref: `Note ${partnerNoteId}` }] : []),
    ],
  }
}

const NoteHoldEndEntity = (
  beat: number,
  endBeat: number,
  lineId: number,
  isChallenge: boolean,
  noteId: number,
): LevelDataEntity => {
  return {
    name: `Hold Note End ${noteId}`,
    archetype: `${isChallenge ? "Challenge" : "Normal"}HoldEndNote`,
    data: [
      { name: "Beat", value: beat },
      { name: "EndBeat", value: endBeat },
      { name: "Line", ref: `Line${lineId}` },
      { name: "HoldStart", ref: `Note ${noteId}` },
    ],
  }
}

const CanvasMoveEntity = (
  beat: number,
  index: number,
  canvas: number,
  yPos: number,
  easeType: number,
): LevelDataEntity => {
  return {
    name: `CanvasMove${canvas}-${index}`,
    archetype: "CanvasMove",
    data: [
      { name: "Beat", value: beat },
      { name: "NextEventEntity", ref: `CanvasMove${canvas}-${index + 1}` },
      { name: "Canvas", value: canvas },
      { name: "Value", value: yPos },
      { name: "EaseType", value: easeType },
    ],
  }
}

const CanvasSpeedEntity = (
  beat: number,
  index: number,
  canvas: number,
  speed: number,
  easeType: number,
): LevelDataEntity => {
  return {
    name: `CanvasSpeed${canvas}-${index}`,
    archetype: "CanvasSpeed",
    data: [
      { name: "Beat", value: beat },
      { name: "NextEventEntity", ref: `CanvasSpeed${canvas}-${index + 1}` },
      { name: "Canvas", value: canvas },
      { name: "Value", value: speed },
      { name: "EaseType", value: easeType },
    ],
  }
}

const CameraMoveEntity = (
  beat: number,
  index: number,
  yPos: number,
  easeType: number,
): LevelDataEntity => {
  return {
    name: `CameraMove-${index}`,
    archetype: "CameraMove",
    data: [
      { name: "Beat", value: beat },
      { name: "NextEventEntity", ref: `CameraMove-${index + 1}` },
      { name: "Value", value: yPos },
      { name: "EaseType", value: easeType },
    ],
  }
}

const CameraScaleEntity = (
  beat: number,
  index: number,
  scale: number,
  easeType: number,
): LevelDataEntity => {
  return {
    name: `CameraScale-${index}`,
    archetype: "CameraScale",
    data: [
      { name: "Beat", value: beat },
      { name: "NextEventEntity", ref: `CameraScale-${index + 1}` },
      { name: "Value", value: scale },
      { name: "EaseType", value: easeType },
    ],
  }
}

export type chartInfo = {
  themes: RizThemes
  lineColors: string[]
  judgeRingColors: string[]
}

const getColorIndex = (rizcolor: RizColor, colorArray: string[]) => {

  const color = hexColor(rizcolor)
  let index: number

  if (colorArray.includes(color)) {
    index = colorArray.indexOf(color)
  } else {
    index = colorArray.push(color) - 1
  }

  return index
}

export const convertsChart = (chart: RizChart): { data: LevelData; info: chartInfo } => {
  let lineColors: string[] = []
  let judgeRingColors: string[] = []
  let ChallengeTotalHitCount = 0

  //entity array to populate
  let bpmEntities: LevelDataEntity[] = new Array()
  let ChallengeEntities: LevelDataEntity[] = new Array()
  let LineEntities: LevelDataEntity[] = new Array()
  let LinePointEntities: LevelDataEntity[] = new Array()
  let NoteEntities: LevelDataEntity[] = new Array()
  let LineColorEntities: LevelDataEntity[] = new Array()
  let JudgeRingColorEntities: LevelDataEntity[] = new Array()

  //bpm change entities
  chart.bpmShifts.forEach((element) =>
    bpmEntities.push(BpmChangeEntity(element.time, element.value * chart.bPM)),
  )

  //challenge time
  chart.challengeTimes.forEach((ct) => {
    ChallengeEntities.push(ChallengeEntity(ct.start, "Start"))
    ChallengeEntities.push(ChallengeEntity(ct.end, "End"))
  })

  //used to check if 2 notes are at the same time
  let notesAtSameTime = new Map<number, number[]>() //note time - note ids

  chart.lines.forEach((l, lIdx) =>
    l.notes.forEach((n, nIdx) => {
      if (n.type == RizNoteType.Drag) return
      const noteId = lIdx * 100000 + nIdx
      let noteIds = notesAtSameTime.get(n.time) ?? []
      noteIds.push(noteId)
      notesAtSameTime.set(n.time, noteIds)
    }),
  )

  //line, line point, and note
  chart.lines.forEach((line, lineIndex) => {
    //sort events because somehow they are sometimes not sorted
    line.linePoints.sort((a, b) => a.time - b.time)
    line.lineColor.sort((a, b) => a.time - b.time)
    line.judgeRingColor.sort((a, b) => a.time - b.time)

    // add lines, line names are `LineN`, line start and ends are first and last points time
    LineEntities.push(LineEntity(lineIndex))

    //add points, a lane is made of a bunch of points

    const hasLineColor = line.lineColor.length > 0
    let spawnTime = line.linePoints[0].time
    line.linePoints.forEach((point, pointIndex) => {
      //if the line has lineColor then we should alwyas use it instead i think
      const colorIndex = hasLineColor ? -1 : getColorIndex(point.color, lineColors)

      LinePointEntities.push(
        LinePointEntity(
          point.time,
          spawnTime,
          pointIndex,
          lineIndex,
          point.canvasIndex,
          point.xPosition,
          point.easeType,
          colorIndex,
          point.color.a,
          pointIndex === line.linePoints.length - 1,
        ),
      )
      spawnTime = point.time
    })

    line.lineColor.forEach((lineColor, pointIndex) => {
      if (lineColor.startColor.a !== 255) console.log(lineColor.startColor.a)
      const colorIndex = getColorIndex(lineColor.startColor, lineColors)

      let previousTime = line.linePoints[0].time
      LineColorEntities.push(
        ColorKeyPoint(
          lineColor.time,
          pointIndex == 0 ? line.linePoints[0].time : lineColor.time,
          "Line",
          lineIndex,
          pointIndex,
          colorIndex,
          lineColor.startColor.a,
        ),
      )
      previousTime = lineColor.time
    })

    line.judgeRingColor.forEach((ringColor, pointIndex) => {
      const colorIndex = getColorIndex(ringColor.startColor, judgeRingColors)

      let previousTime = line.linePoints[0].time
      JudgeRingColorEntities.push(
        ColorKeyPoint(
          ringColor.time,
          pointIndex == 0 ? line.linePoints[0].time : ringColor.time,
          "JudgeRing",
          lineIndex,
          pointIndex,
          colorIndex,
          ringColor.startColor.a,
        ),
      )
      previousTime = ringColor.time
    })

    //add notes, during runtime we calculate the note's sonolus y/ rizline x based on the position of the 2 points(on the same line) it's between
    line.notes.forEach((note, noteIndex) => {
      const LastLinePoint = line.linePoints.findIndex(
        (p, i) => p.time <= note.time && line.linePoints[i + 1].time >= note.time,
      )
      const noteId = lineIndex * 100000 + noteIndex //only used for hold & double notes

      const isDoubleNote = notesAtSameTime.get(note.time)?.length >= 2
      const partnerNoteId = isDoubleNote
        ? notesAtSameTime.get(note.time).filter((v) => v != noteId)[0]
        : -1

      const isChallenge = chart.challengeTimes.some(
        (ct) => note.time >= ct.start && note.time <= ct.end,
      )
      if (isChallenge) ChallengeTotalHitCount++

      NoteEntities.push(
        NoteEntity(
          note.time,
          lineIndex,
          LastLinePoint,
          note.type,
          isChallenge,
          noteId,
          isDoubleNote,
          partnerNoteId,
        ),
      )

      if (note.type === RizNoteType["Hold"]) {
        if (isChallenge) ChallengeTotalHitCount++
        NoteEntities.push(
          NoteHoldEndEntity(note.time, note.otherInformations[0], lineIndex, isChallenge, noteId),
        )
      }
    })
  })

  //canvas change entities
  let CanvasMoveEntities: LevelDataEntity[] = new Array()
  let CanvasSpeedEntities: LevelDataEntity[] = new Array()

  chart.canvasMoves.forEach((canvas) => {
    canvas.xPositionKeyPoints.forEach((point, index) => {
      CanvasMoveEntities.push(
        CanvasMoveEntity(point.time, index, canvas.index, point.value, point.easeType),
      )
    })
    canvas.speedKeyPoints.forEach((point, index) => {
      //That easeType probably ain't correct, however it seems that every `speedKeyPoints` has an `easeType` of 0
      CanvasSpeedEntities.push(
        CanvasSpeedEntity(
          point.time,
          index,
          canvas.index,
          point.value,
          point.easeType === 0 ? 13 : point.easeType,
        ),
      )
    })
  })

  //camera change entities
  let CameraMoveEntities: LevelDataEntity[] = new Array()
  let CameraScaleEntities: LevelDataEntity[] = new Array()

  chart.cameraMove.scaleKeyPoints.forEach((point, index) => {
    CameraScaleEntities.push(CameraScaleEntity(point.time, index, point.value, point.easeType))
  })

  chart.cameraMove.xPositionKeyPoints.forEach((point, index) => {
    CameraMoveEntities.push(CameraMoveEntity(point.time, index, point.value, point.easeType))
  })

  //merge all the enties in a single array
  let convertedEntities = [
    ...bpmEntities,
    ...ChallengeEntities,

    ...LineEntities,
    ...LinePointEntities,
    ...LineColorEntities,
    ...JudgeRingColorEntities,
    ...NoteEntities,
    ...CanvasMoveEntities,
    ...CanvasSpeedEntities,
    ...CameraMoveEntities,
    //...CameraScaleEntities
  ]

  //sort entities based on their spawn time, not actually needed for Play Mode
  /** convertedEntities.sort((a, b) => {
    const timeA: number = (a.data.find(item => item.name === "Beat" || item.name === "SpawnBeat" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    const timeB: number = (b.data.find(item => item.name === "Beat" || item.name === "SpawnBeat" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    if (timeA === undefined || timeB === undefined) return 0
    if (timeA < timeB) return -1
    if (timeA > timeB) return 1
    return 0
  })*/

  //add the "default" entities present in every level
  const entities: LevelDataEntity[] = [
    {
      archetype: "Initialization",
      data: [{ name: "ChallengeTotalHitCount", value: ChallengeTotalHitCount }],
    },
    {
      archetype: "Stage",
      data: [],
    },
    ...convertedEntities,
  ]

  //pack to level data and return
  const data: LevelData = {
    bgmOffset: chart.offset || 0,
    entities: entities,
  }

  return { data, info: { themes: chart.themes, lineColors, judgeRingColors } }
}
