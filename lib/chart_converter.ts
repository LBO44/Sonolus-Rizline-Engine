import { EngineArchetypeDataName, EngineArchetypeName, LevelData, LevelDataEntity } from '@sonolus/core'


//Rizline chart object type, incomplete, thanks to https://rgwiki.stary.pc.pl/wiki/Rizline:Chart_file
type RizKeyPoint = {
  time: number,
  value: number,
  easeType: number
}

type RizColor = {
  r: number,
  g: number,
  b: number,
  a: number
}

export enum RizNoteType {
  Tap,
  Catch,
  Hold
}

export type RizChart = { //incomplete
  fileVersion: number,
  songsName: string,
  offset: number, //should always be 0
  bPM: number,
  bpmShifts: RizKeyPoint[],
  lines: {
    linePoints: { time: number, xPosition: number, canvasIndex: number, easeType: number, color: RizColor }[],
    notes: { type: RizNoteType, time: number, otherInformations: number[] }[]
  }[],
  canvasMoves: {
    index: number, xPositionKeyPoints: RizKeyPoint[], speedKeyPoints: RizKeyPoint[],
  }[],
  cameraMove: {
    scaleKeyPoints: RizKeyPoint[],
    xPositionKeyPoints: RizKeyPoint[],
  }
}


//LevelDataEntity generator functions
const BpmChangeEntity = (beat: number, bpm: number): LevelDataEntity => {
  return {
    archetype: EngineArchetypeName.BpmChange,
    data: [
      { name: EngineArchetypeDataName.Beat, value: beat },
      { name: EngineArchetypeDataName.Bpm, value: bpm }]
  }
}

//line entity only handles drawing the judge ring
const LineEntity = (lineIndex: number, startTime: number, endTime: number): LevelDataEntity => {
  return {
    name: `Line${lineIndex}`,
    archetype: 'Line',
    data: [
      { name: "FirstPoint", ref: `Line${lineIndex}-Point0` },
      { name: "StartTime", value: Math.max(0, startTime) },
      { name: "EndTime", value: endTime }]
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
  color: RizColor,
  isLastPoint = false): LevelDataEntity => {
  return {
    name: `Line${line}-Point${pointIndex}`,
    archetype: 'LinePoint',
    data: [
      { name: "HitBeat", value: Math.max(0, hitBeat) },
      { name: "SpawnBeat", value: spawnBeat },
      { name: "Line", ref: `Line${line}` },
      { name: "NextPoint", ref: `Line${line}-Point${pointIndex + 1}` }, //this value will be incorrect if last point
      { name: "YPos", value: yPos }, //renamed x pos to y pos as rizline x corresponds to sonolus y
      { name: "IsLastPoint", value: +isLastPoint },
      { name: "Canvas", value: canvas },
      { name: "EaseType", value: easeType },
      //{ name: "ColorR", value: 1 - color.r / 255 },
      //{ name: "ColorG", value: 1 - color.g / 255 },
      //{ name: "ColorB", value: 1 - color.b / 255 },
      { name: "ColorA", value: color.a / 255 }]
  }
}

const NoteEntity = (beat: number, line: number, LastPoint: number, type: RizNoteType, otherInformations: number[]): LevelDataEntity => {
  return {
    archetype: `${RizNoteType[type]}Note`,
    data: [
      { name: "Beat", value: beat },
      { name: "Line", ref: `line${line}` },
      { name: "LastPoint", ref: `Line${line}-Point${LastPoint}` },
      { name: "NextPoint", ref: `Line${line}-Point${LastPoint + 1}` },
      ...(type == RizNoteType.Hold) ? [
        { name: "HoldEndBeat", value: otherInformations[0] },
        { name: "HoldDurationBeat", value: otherInformations[1] }
      ] : []
    ]
  }
}

const CanvasMoveEntity = (beat: number, index: number, canvas: number, yPos: number, easeType: number): LevelDataEntity => {
  return {
    name: `CanvasMove${canvas}-${index}`,
    archetype: 'CanvasMove',
    data: [
      { name: "Beat", value: beat },
      { name: "NextCanvasEntity", ref: `CanvasMove${canvas}-${index + 1}` },
      { name: "Canvas", value: canvas },
      { name: "Value", value: yPos },
      { name: "EaseType", value: easeType }]
  }
}

const CanvasSpeedEntity = (beat: number, index: number, canvas: number, speed: number, easeType: number): LevelDataEntity => {
  return {
    name: `CanvasSpeed${canvas}-${index}`,
    archetype: 'CanvasSpeed',
    data: [
      { name: "Beat", value: beat },
      { name: "NextCanvasEntity", ref: `CanvasSpeed${canvas}-${index + 1}` },
      { name: "Canvas", value: canvas },
      { name: "Value", value: speed },
      { name: "EaseType", value: easeType }]
  }
}

const CameraMoveEntity = (beat: number, index: number, yPos: number, easeType: number): LevelDataEntity => {
  return {
    name: `CameraMove-${index}`,
    archetype: 'CameraMove',
    data: [
      { name: "Beat", value: beat },
      { name: "NextCameraEntity", ref: `CameraMove-${index}` },
      { name: "Value", value: yPos },
      { name: "EaseType", value: easeType }]
  }
}

const CameraScaleEntity = (beat: number, index: number, scale: number, easeType: number): LevelDataEntity => {
  return {
    name: `CameraScale-${index}`,
    archetype: 'CameraScale',
    data: [
      { name: "Beat", value: beat },
      { name: "NextCameraEntity", ref: `CameraScale-${index + 1}` },
      { name: "Value", value: scale },
      { name: "EaseType", value: easeType }]
  }
}

export const convertsChart = (chart: RizChart): LevelData => {

  //array to populate
  let bpmEntities: (LevelDataEntity)[] = new Array
  let LineEntities: (LevelDataEntity)[] = new Array
  let LinePointEntities: (LevelDataEntity)[] = new Array
  let NoteEntities: (LevelDataEntity)[] = new Array

  //bpm change entities
  chart.bpmShifts.forEach((element) => bpmEntities.push(BpmChangeEntity(element.time, element.value * chart.bPM)))

  //line, line point, and note
  chart.lines.forEach((line, lineIndex) => {
    //if (line.notes.length == 0 || line.linePoints.length == 0) return //igore lines without notes

    // add lines, line names are `LineN`, line start and ends are first and last points time
    LineEntities.push(LineEntity(lineIndex, line.linePoints[0].time, line.linePoints[line.linePoints.length - 1].time))

    //add points, a lane is made of a bunch of points
    let spawnTime = line.linePoints[0].time
    line.linePoints.forEach((point, pointIndex) => {
      LinePointEntities.push(LinePointEntity(point.time, spawnTime, pointIndex, lineIndex, point.canvasIndex, point.xPosition, point.easeType, point.color, pointIndex === line.linePoints.length - 1))
      spawnTime = point.time
    })

    //add notes, during runtime we calculate the note's sonolus y/ rizline x based on the position of the 2 points(on the same line) it's between
    line.notes.forEach((note) => {

      const LastLinePoint = line.linePoints.findIndex((p, i) => (p.time <= note.time && line.linePoints[i + 1].time >= note.time))

      NoteEntities.push(NoteEntity(note.time, lineIndex, LastLinePoint, note.type, note.otherInformations))

    })
  })

  //canvas change entities
  let CanvasMoveEntities: (LevelDataEntity)[] = new Array
  let CanvasSpeedEntities: (LevelDataEntity)[] = new Array

  chart.canvasMoves.forEach((canvas) => {
    canvas.xPositionKeyPoints.forEach((point, index) => {
      CanvasMoveEntities.push(CanvasMoveEntity(point.time, index, canvas.index, point.value, point.easeType))
    })
    canvas.speedKeyPoints.forEach((point, index) => {
      //That easeType probably ain't correct, however it seems that every `speedKeyPoints` has an `easeType` of 0
      CanvasSpeedEntities.push(CanvasSpeedEntity(point.time, index, canvas.index, point.value, (point.easeType===0)? 13: point.easeType))
    })
  })

  //camera change entities
  let CameraMoveEntities: (LevelDataEntity)[] = new Array
  let CameraScaleEntities: (LevelDataEntity)[] = new Array

  chart.cameraMove.scaleKeyPoints.forEach((point, index) => {
    CameraScaleEntities.push(CameraScaleEntity(point.time, index, point.value, point.easeType))
  })

  chart.cameraMove.xPositionKeyPoints.forEach((point, index) => {
    CameraMoveEntities.push(CameraMoveEntity(point.time, index, point.value, point.easeType))
  })


  //merge all the enties in a single array
  let convertedEntities = [
    //...LineEntities,
    ...bpmEntities,
    ...LinePointEntities,
    ...NoteEntities,
    ...CanvasMoveEntities,
    ...CanvasSpeedEntities,
    ...CameraMoveEntities,
    //...CameraScaleEntities
  ]

  //sort entities based on their spawn time 
  convertedEntities.sort((a, b) => {
    const timeA: number = (a.data.find(item => item.name === "Beat" || item.name === "SpawnBeat" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    const timeB: number = (b.data.find(item => item.name === "Beat" || item.name === "SpawnBeat" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    if (timeA === undefined || timeB === undefined) return 0
    if (timeA < timeB) return -1
    if (timeA > timeB) return 1
    return 0
  })

  //add the "default" entities present in every level
  const entities = [
    { archetype: 'Initialization', data: [] },
    { archetype: 'Stage', data: [] },
    ...convertedEntities
  ]

  //pack to level data and return
  const data: LevelData = {
    bgmOffset: chart.offset,
    entities: entities
  }

  return data
}
