import {
	type EngineArchetypeDataName,
	EngineArchetypeName,
	type LevelData,
	type LevelDataEntity,
} from "@sonolus/core"

//Rizline chart object types, check out https://rgwiki.stary.pc.pl/wiki/Rizline:Chart_file for more details

/** Rizline ease type */
enum RizEaseType {
	Linear = 0,
	InQuad = 1,
	OutQuad = 2,
	InOutQuad = 3,
	InCubic = 4,
	OutCubic = 5,
	InOutCubic = 6,
	InQuart = 7,
	OutQuart = 8,
	InOutQuart = 9,
	InQuint = 10,
	OutQuint = 11,
	InOutQuint = 12,
	Zero = 13,
	One = 14,
	InCirc = 15,
	OutCirc = 16,
	OutSine = 17,
	InSine = 18,
}

// All times are in beat

// floorPosition are the pre-calculated target times (considering canvas speed changes and bpm shifts)
// Usually floorPosition is used for drawing the lines and notes
// while time is used for hit time and canvas/camera event

/** BMP shifts and canvas speed also have easeType but it's always 0 and doesn't have any effect*/
type RizKeyPoint = {
	time: number
	value: number
	easeType: RizEaseType
	/** floorPosition is only used for canvas speed and bpm shifts. For canvas/camera move and scale it's usually 0 */
	floorPosition: number
}

/** rgba, 0 to 255 int*/
type RizColor = {
	r: number
	g: number
	b: number
	a: number
}

/** Color (and alpha) transition from the point startColor to the point endColor according to the point time and the next point time
 * Sometimes the point endColor and the nextPoint startColor don't match: it instatnly switch colors
 * For the last point, it will stay at startColor. Usually for last point startColor = endColor but that doesn't mattter
 * Points can be way before/after the line first/last beat */
type RizColorKeyPoint = {
	startColor: RizColor
	endColor: RizColor
	time: number
}

type RizColorList = [background: RizColor, note: RizColor, particle: RizColor]
/** Colors of the level, changes during challenge time.
 * First color list is for "normal" time, second one for 1st challenge time, third one for 2nd challenge time...
 * However only Brave Road has challenge times with different colours for now*/
type RizThemes = [
	normal: { colorsList: RizColorList },
	challenge: { colorsList: RizColorList },
]

enum RizNoteType {
	Tap = 0,
	Drag = 1,
	Hold = 2,
}

export type RizChart = {
	/** 0 except for Tempest IN where it's 1 but no difference */
	fileVersion: 0
	/** was usually empty, removed from newer charts */
	songsName?: string
	/** was always 0, removed from newer charts */
	offset?: number
	themes: RizThemes
	bPM: number
	bpmShifts: RizKeyPoint[]
	/** Intervals where the colors change and notes heal */
	challengeTimes: {
		/** unknown, usually equals to start time */
		checkPoint: number
		start: number
		end: number
		/** transition animation duration in beat, happens after start/end time */
		transTime: number
	}[]
	lines: {
		linePoints: {
			time: number
			xPosition: number
			/** Local line color and alpha gradient from this point to the next */
			color: RizColor
			easeType: number
			canvasIndex: number
			floorPosition: number
		}[]
		notes: ({ time: number; floorPosition: number } & (
			| {
					type: RizNoteType.Hold
					otherInformations: [
						/**for hold end input/when to despawn the hold note (in beat) */
						holdEndTime: number,
						/** usually a float, but always end with .0 */
						holdEndCanvasIndex: number,
						/** Rizline use it to figure out the hold visual length / where to draw the hold end */
						holdEndFloorPosition: number,
					]
			  }
			| { type: RizNoteType.Tap | RizNoteType.Drag; otherInformations: [] }
		))[]
		/** Chnage the color and alpha of the line's judge over time, with linear transitions.
		 * Array can be empty */
		judgeRingColor: RizColorKeyPoint[]
		/**  Global color change over time that applies to tye whole line
		 * Applies the color on top of LinePoint color according to LineColor alpha
		 * IE: LineColor alpha of 0 will have no effect at all, alpha of 255 will completely override LinePoint color, and other other alphas will "merge" LineColor with LinePoint color
		 * Line alpha is always and only determined by LinePoint
		 * Array can be empty*/
		lineColor: RizColorKeyPoint[]
	}[]
	canvasMoves: {
		index: number
		xPositionKeyPoints: RizKeyPoint[]
		speedKeyPoints: RizKeyPoint[]
	}[]
	cameraMove: {
		/** scale notes and judge rings size, particles unaffected */
		scaleKeyPoints: RizKeyPoint[]
		xPositionKeyPoints: RizKeyPoint[]
	}
}

/** Info made during chart convertion used for skin generation*/
export type convertedChartInfo = {
	themes: RizThemes
	lineColors: string[]
	judgeRingColors: string[]
}

/** rgb (+ a) color to hex string, ignore alpha*/
export const hexColor = (color: RizColor): string => {
	const toHex = (value: number) => value.toString(16).padStart(2, "0")
	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}

/** return the index of the color in its array, and add it if it's not in it yet*/
const getColorIndex = (rizcolor: RizColor, colorArray: string[]) => {
	const color = hexColor(rizcolor)
	let index: number

	if (colorArray.includes(color)) {
		index = colorArray.indexOf(color)
	} else {
		index = colorArray.push(color) - 1
	}

	return Math.min(index, 31)
}

const entity = (
	archetype: EngineArchetypeName | string,
	data: Record<string | EngineArchetypeDataName, number | string>,
	name?: string
): LevelDataEntity => {
	return {
		name,
		archetype,
		data: Object.entries(data).map(([name, val]) =>
			typeof val === "string" ? { name, ref: val } : { name, value: val }
		),
	}
}

export const convertsChart = (
	chart: RizChart,
	difficulty: "ez" | "hd" | "in" | "at"
): { data: LevelData; info: convertedChartInfo } => {
	const lineColors: string[] = []
	const judgeRingColors: string[] = []

	const entities: LevelDataEntity[] = []

	/** Used to calculate the amount of life challenge notes heal when hit*/
	let challengeTotalHitCount = 0

	// adding the satge now but we'll modify at the end
	entities.push(entity("Stage", { challengeTotalHitCount: 0 }))

	//bpm change entities
	chart.bpmShifts.forEach((event) =>
		entities.push(
			entity(EngineArchetypeName.BpmChange, {
				"#BEAT": event.time,
				"#BPM": event.value * chart.bPM,
			})
		)
	)

	//challenge time
	chart.challengeTimes.forEach((challengeTime) => {
		entities.push(
			entity("Challenge Time", {
				startBeat: challengeTime.start,
				endBeat: challengeTime.end,
				transitionDuration: challengeTime.transTime,
			})
		)
	})

	//line, line point, and note
	/**Map each note to its beat to find double notes*/
	const notesAtSameTime = new Map<number, string[]>()

	chart.lines.forEach((line, lineIndex) =>
		line.notes.forEach((note, noteIndex) => {
			if (note.type == RizNoteType.Drag) return
			const noteName = `Line ${lineIndex} Note ${noteIndex}`
			const noteNames = notesAtSameTime.get(note.time) ?? []
			noteNames.push(noteName)
			notesAtSameTime.set(note.time, noteNames)
		})
	)

	chart.lines.forEach((line, lineIndex) => {
		// Sometimes not sorted by default, no idea if that's intentional or not
		// line.linePoints.sort((a, b) => a.time - b.time)

		const lastBeat = Math.max(...line.linePoints.map((point) => point.time))

		// add lines, line names are `LineN`, used at runtime to store line info
		entities.push(
			entity(
				"Line",
				{
					lastBeat: lastBeat,
					firstPoint: `Line ${lineIndex} Point 0`,
					hasHoldNotes: +line.notes.some(
						(note) => note.type == RizNoteType.Hold
					),
					hasLineColors: +(line.lineColor.length > 0),
				},
				`Line ${lineIndex}`
			)
		)

		line.linePoints.forEach((point, pointIndex) => {
			const colorIndex = getColorIndex(point.color, lineColors)

			entities.push(
				entity(
					"Line Point",
					{
						"#BEAT": point.time,
						floorPosition: point.floorPosition,
						yPos: point.xPosition,
						easeType: point.easeType,
						alpha: point.color.a / 255,
						colorIndex: colorIndex,
						nextPoint: `Line ${lineIndex} Point ${pointIndex + 1}`,
						canvas: `Canvas ${point.canvasIndex}`,
						line: `Line ${lineIndex}`,
					},
					`Line ${lineIndex} Point ${pointIndex}`
				)
			)
		})

		line.lineColor.sort((a, b) => a.time - b.time)
		line.lineColor.forEach((lineColor, pointIndex) => {
			const startColorIdx = getColorIndex(lineColor.startColor, lineColors)
			const endColorIdx = getColorIndex(lineColor.endColor, lineColors)

			const hasTransition =
				lineColor.startColor.r !== lineColor.endColor.r ||
				lineColor.startColor.g !== lineColor.endColor.g ||
				lineColor.startColor.b !== lineColor.endColor.b ||
				lineColor.startColor.a !== lineColor.endColor.a

			entities.push(
				entity("Line Color", {
					"#BEAT": lineColor.time,
					startAlpha: lineColor.startColor.a / 255,
					endAlpha: lineColor.endColor.a / 255,
					startColorIndex: startColorIdx,
					endColorIndex: endColorIdx,
					hasTransition: +(
						hasTransition && line.lineColor[pointIndex + 1] !== undefined
					),
					isFirstPoint: +(pointIndex == 0),
					nextBeat: line.lineColor[pointIndex + 1]?.time ?? 0,
					line: `Line ${lineIndex}`,
				})
			)
		})

		line.judgeRingColor.sort((a, b) => a.time - b.time)
		line.judgeRingColor.forEach((ringColor, pointIndex) => {
			const startColorIdx = getColorIndex(ringColor.startColor, judgeRingColors)
			const endColorIdx = getColorIndex(ringColor.endColor, judgeRingColors)

			const hasTransition =
				ringColor.startColor.r !== ringColor.endColor.r ||
				ringColor.startColor.g !== ringColor.endColor.g ||
				ringColor.startColor.b !== ringColor.endColor.b ||
				ringColor.startColor.a !== ringColor.endColor.a

			entities.push(
				entity("Judge Ring Color", {
					"#BEAT": ringColor.time,
					startAlpha: ringColor.startColor.a / 255,
					endAlpha: ringColor.endColor.a / 255,
					startColorIndex: startColorIdx,
					endColorIndex: endColorIdx,
					hasTransition: +(
						hasTransition && line.judgeRingColor[pointIndex + 1] !== undefined
					),
					isFirstPoint: +(pointIndex == 0),
					nextBeat: line.judgeRingColor[pointIndex + 1]?.time ?? 0,
					line: `Line ${lineIndex}`,
				})
			)
		})

		//add notes
		line.notes.forEach((note, noteIndex) => {
			//at runtime note vertical pos is calculated by interpolating the pos of the 2 points it's between
			const previousLinePointIndex = line.linePoints
				.slice(0, -1)
				.findLastIndex((p) => p.time <= note.time)

			const noteName = `Line ${lineIndex} Note ${noteIndex}`

			const isDoubleNote = notesAtSameTime.get(note.time)?.length >= 2
			const partnerNoteName = isDoubleNote
				? notesAtSameTime.get(note.time).filter((v) => v != noteName)[0]
				: -1

			const isChallenge = chart.challengeTimes.some(
				(ct) => note.time >= ct.start && note.time <= ct.end
			)

			if (isChallenge) challengeTotalHitCount++

			entities.push(
				entity(
					`Note ${isChallenge ? "Challenge" : "Normal"}`,
					{
						"#BEAT": note.time,
						floorPosition: note.floorPosition,
						previousLinePoint: `Line ${lineIndex} Point ${previousLinePointIndex}`,
						partnerNote: partnerNoteName,
						kind: note.type,
					},
					...(isDoubleNote || note.type == RizNoteType.Hold ? [noteName] : [])
				)
			)

			if (note.type == RizNoteType.Hold) {
				if (isChallenge) challengeTotalHitCount++
				entities.push(
					entity(`Note Hold Tail ${isChallenge ? "Challenge" : "Normal"}`, {
						"#BEAT": note.otherInformations[0],
						floorPosition: note.otherInformations[2],
						canvas: `Canvas ${note.otherInformations[1]}`,
						holdStart: noteName,
					})
				)
			}
		})
	})

	//canvas entities

	chart.canvasMoves.forEach((canvas) => {
		entities.push(
			entity(
				"Canvas",
				{
					firstSpeed: `Canvas ${canvas.index} Speed 0`,
				},
				`Canvas ${canvas.index}`
			)
		)

		canvas.xPositionKeyPoints.forEach((point, pointIndex) => {
			entities.push(
				entity(
					"Canvas Move",
					{
						"#BEAT": point.time,
						value: point.value,
						easeType: point.easeType,
						isFirstPoint: +(pointIndex == 0),
						canvas: `Canvas ${canvas.index}`,
						nextPoint: `Canvas ${canvas.index} Move ${pointIndex + 1}`,
					},
					`Canvas ${canvas.index} Move ${pointIndex}`
				)
			)
		})

		canvas.speedKeyPoints.forEach((point, pointIndex) => {
			entities.push(
				entity(
					"Canvas Speed",
					{
						"#BEAT": point.time,
						value: point.value,
						floorPosition: point.floorPosition,
						isFirstPoint: +(pointIndex == 0),
						canvas: `Canvas ${canvas.index}`,
						nextPoint: `Canvas ${canvas.index} Speed ${pointIndex + 1}`,
					},
					`Canvas ${canvas.index} Speed ${pointIndex}`
				)
			)
		})
	})

	//camera change entities

	chart.cameraMove.scaleKeyPoints.forEach((point, pointIndex) => {
		entities.push(
			entity(
				"Camera Scale",
				{
					"#BEAT": point.time,
					value: point.value,
					easeType: point.easeType,
					isFirstPoint: +(pointIndex == 0),
					nextPoint: `Camera Scale ${pointIndex + 1}`,
				},
				`Camera Scale ${pointIndex}`
			)
		)
	})

	chart.cameraMove.xPositionKeyPoints.forEach((point, pointIndex) => {
		entities.push(
			entity(
				"Camera Move",
				{
					"#BEAT": point.time,
					value: point.value,
					easeType: point.easeType,
					isFirstPoint: +(pointIndex == 0),
					nextPoint: `Camera Move ${pointIndex + 1}`,
				},
				`Camera Move ${pointIndex}`
			)
		)
	})

	entities[0] = entity("Stage", {
		challengeTotalHitCount: challengeTotalHitCount,
		difficulty: { ez: 0, hd: 1, in: 2, at: 2 }[difficulty] ?? 2,
	})

	//for debugging
	entities
		.filter((entity) => !entity.archetype.startsWith("#"))
		.forEach((entity, i) => (entity.__index = i))

	//pack to level data and return
	const data: LevelData = {
		//also for debugging
		__colors: {
			line: lineColors.map((c, i) => `${i} - ${c}`),
			judgeRing: judgeRingColors.map((c, i) => `${i} - ${c}`),
		},

		bgmOffset: chart.offset ?? 0,
		entities: entities,
	}
	return { data, info: { themes: chart.themes, lineColors, judgeRingColors } }
}
