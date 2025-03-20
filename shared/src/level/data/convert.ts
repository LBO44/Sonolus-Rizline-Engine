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

const enum RizNoteType {
  Tap,
  Catch,
  Hold
}

type RizChart = { //incomplete
  fileVersion: number,
  songsName: string,
  offset: number, //should always be 0
  bPM: number,
  bpmShifts: RizKeyPoint[],
  lines: {
    linePoints: { time: number, xPosition: number, canvasIndex: number, color: RizColor }[],
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
const BpmChangeEntity = (time: number, bpm: number): LevelDataEntity => {
  return {
    archetype: EngineArchetypeName.BpmChange,
    data: [
      { name: EngineArchetypeDataName.Beat, value: time },
      { name: EngineArchetypeDataName.Bpm, value: bpm }]
  }
}

const LineEntity = (lineIndex: number, startTime: number, endTime: number): LevelDataEntity => {
  return {
    name: `Line${lineIndex}`,
    archetype: 'Line',
    data: [
      { name: "FirstPoint", ref: `Line${lineIndex}-Point0` },
      { name: "StartTime", value: startTime },
      { name: "EndTime", value: endTime }]
  }
}

const LinePointEntity = (time:number, spawnTime:number, pointIndex:number, lineIndex: number, canvasId: number, yPos: number, color: RizColor, isLastPoint = false): LevelDataEntity => {
  return {
    name: `Line${lineIndex}-Point${pointIndex}`,
    archetype: 'LinePoint',
    data: [
      { name: "Time", value: time },
      { name: "SpawnTime", value: spawnTime },
      { name: "Line", ref: `Line${lineIndex}` },
      { name: "NextPoint", ref: `Line${lineIndex}-Point${pointIndex+1}` }, //this value will be incorrect if last point
      { name: "YPos", value: yPos }, //renamed x pos to y pos as rizline x corresponds to sonolus y
      { name: "IsLastPoint", value: +isLastPoint },
      { name: "CanvasId", value: canvasId },
      //{ name: "ColorR", value: 1 - color.r / 255 },
      //{ name: "ColorG", value: 1 - color.g / 255 },
      //{ name: "ColorB", value: 1 - color.b / 255 },
      { name: "ColorA", value: color.a }]
  }
}

const NoteEntity = (time: number,lineIndex:number, LastPointIndex: number): LevelDataEntity => {
  return {
    archetype: 'Note',
    data: [
      { name: "Time", value: time },
      { name: "Line", ref: `line${lineIndex}` },
      { name: "LastPoint", ref: `Line${lineIndex}-Point${LastPointIndex}` },
      { name: "NextPoint", ref: `Line${lineIndex}-Point${LastPointIndex+1}` }]
  }
}

const CanvasMoveEntity = (time: number, index: number, canvasId: number, yPos: number): LevelDataEntity => {
  return {
    name: `CanvasMove${canvasId}-${index}`,
    archetype: 'CanvasMove',
    data: [
      { name: "Time", value: time },
      { name: "NextCanvasMove", ref: `CanvasMove${canvasId}-${index + 1}` },
      { name: "CanvasId", value: canvasId },
      { name: "YPos", value: yPos }]
  }
}

const CanvasSpeedEntity = (time: number, index: number, canvasId: number, speed: number): LevelDataEntity => {
  return {
    name: `CanvasSpeed${canvasId}-${index}`,
    archetype: 'CanvasSpeed',
    data: [
      { name: "Time", value: time },
      { name: "NextCanvasMove", ref: `CanvasMove${canvasId}-${index + 1}` },
      { name: "CanvasId", value: canvasId },
      { name: "Speed", value: speed }]
  }
}

const CameraMoveEntity = (time: number, index: number, yPos: number): LevelDataEntity => {
  return {
    name: `CameraMove-${index}`,
    archetype: 'CameraMove',
    data: [
      { name: "Time", value: time },
      { name: "NextCameraMove", ref: `CameraMove-${index}` },
      { name: "YPos", value: yPos }]
  }
}

const CameraScaleEntity = (time: number, index: number, scale: number): LevelDataEntity => {
  return {
    name: `CameraScale-${index}`,
    archetype: 'CameraScale',
    data: [
      { name: "Time", value: time },
      { name: "NextCameraScale", ref: `CameraScale-${index + 1}` },
      { name: "Scale", value: scale }]
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
    // if (line.notes.length == 0 || line.linePoints.length == 0) return //igore lines without notes

    // add lines, line names are `LineN`, line start and ends are first and last points time
    LineEntities.push(LineEntity(lineIndex, line.linePoints[0].time, line.linePoints[line.linePoints.length - 1].time))

    //add points, a lane is made of a bunch of points
    let spawnTime = 0
    line.linePoints.forEach((point, pointIndex) => {
      LinePointEntities.push(LinePointEntity(point.time,spawnTime,pointIndex , lineIndex, point.canvasIndex, point.xPosition, point.color, pointIndex === line.linePoints.length - 1))
      spawnTime = point.time
    })

    //add notes, during runtime we calculate the note's sonolus y/ rizline x based on the position of the 2 points(on the same line) it's between
    line.notes.forEach((note) => {
      if (note.type === RizNoteType.Tap) {

        const LastLinePoint = line.linePoints.findIndex((p, i) => (p.time <= note.time && line.linePoints[i + 1].time >= note.time))

        NoteEntities.push(NoteEntity(note.time, lineIndex, LastLinePoint))
      }
    })
  })

  //canvas change entities
  let CanvasMoveEntities: (LevelDataEntity)[] = new Array
  let CanvasSpeedEntities: (LevelDataEntity)[] = new Array

  chart.canvasMoves.forEach((canvas) => {
    canvas.xPositionKeyPoints.forEach((point, index) => {
      CanvasMoveEntities.push(CanvasMoveEntity(point.time, index, canvas.index, point.value))
    })
    canvas.speedKeyPoints.forEach((point, index) => {
      CanvasSpeedEntities.push(CanvasSpeedEntity(point.time, index, canvas.index, point.value))
    })
  })

  //camera change entities
  let CameraMoveEntities: (LevelDataEntity)[] = new Array
  let CameraScaleEntities: (LevelDataEntity)[] = new Array

  chart.cameraMove.scaleKeyPoints.forEach((point, index) => {
    CameraScaleEntities.push(CameraScaleEntity(point.time, index, point.value))
  })

  chart.cameraMove.xPositionKeyPoints.forEach((point, index) => {
    CameraMoveEntities.push(CameraMoveEntity(point.time, index, point.value))
  })


  //merge all the enties in a single array
  let convertedEntities = [
    ...LineEntities,
    ...LinePointEntities, 
    ...NoteEntities, 
    //...CanvasMoveEntities,
    //...CanvasSpeedEntities,
    //...CameraMoveEntities,
    //...CameraScaleEntities
  ]

  //sort entities based on their spawn time 
  convertedEntities.sort((a, b) => {
    const timeA: number = (a.data.find(item => item.name === "Time" || item.name === "StartTime" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    const timeB: number = (b.data.find(item => item.name === "Time" || item.name === "StartTime" || item.name == EngineArchetypeDataName.Beat) as { name: string, value: number }).value
    if (timeA === undefined || timeB === undefined) return 0
    if (timeA < timeB) return -1
    if (timeA > timeB) return 1
    return 0
  })

  //add the "default" entities present in every level
  const entities = [
    { archetype: 'Initialization', data: [] },
    { archetype: 'Stage', data: [] },
    ...bpmEntities,
    ...convertedEntities
  ]

  //pack to level data and return
  const data: LevelData = {
    bgmOffset: chart.offset,
    entities: entities
  }

  return data
}
