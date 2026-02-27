import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs"
import { unzipSync } from "node:zlib"
import type {
	DatabaseParticleItem,
	DatabaseSkinItem,
	SkinDataSprite,
} from "@sonolus/core"
import type { RizChart } from "./chart_converter"
import { convertsChart, hexColor } from "./chart_converter"
import { chartInfoToSpritesColors, colorizeSkin } from "./skin/edit_skin"

/*
For each level in `resources/`:
- convert and generate Sonolus Level Data according to its `chart.json`
- generate the corresponding skin element
*/

const baseSkinData: SkinDataSprite[] = JSON.parse(
	unzipSync(readFileSync("./convert/skin/data")).toString()
).sprites

readdirSync("./resources/levels/").forEach((level) => {
	console.log(`Converting ${level}`)

	// Convert level
	const levelPath = `./resources/levels/${level}/`
	const chart: RizChart = JSON.parse(
		readFileSync(`${levelPath}chart.json`, "utf8")
	)
	const converted = convertsChart(
		chart,
		level.split(".").at(-1).toLowerCase() as "ez" | "hd" | "in" //will fallback to in in chart conveter
	)
	writeFileSync(
		`${levelPath}data.json`,
		JSON.stringify(converted.data, null, 2),
		{}
	)

	// add skin
	const skinPath = `./resources/skins/${level}/`
	if (!existsSync(skinPath))
		mkdirSync(skinPath, { recursive: true, mode: 0o777 })
	const spritesColors = chartInfoToSpritesColors(converted.info)

	const skinItem: Partial<DatabaseSkinItem> = {
		name: level,
		version: 4,
		title: { en: level },
		tags: [],
		author: { en: "Rizline" },
		subtitle: { en: "" },
	}

	writeFileSync(`${skinPath}item.json`, JSON.stringify(skinItem, null, 2))
	colorizeSkin(
		"./convert/skin/texture.png",
		baseSkinData,
		spritesColors,
		`${skinPath}texture.png`
	)
	copyFileSync("./convert/skin/data", `${skinPath}data`)
	copyFileSync(`${levelPath}cover.png`, `${skinPath}thumbnail.png`)

	// add paricles
	const particlePath = `./resources/particles/${level}/`
	if (!existsSync(particlePath))
		mkdirSync(particlePath, { recursive: true, mode: 0o777 })

	const paricleItem: Partial<DatabaseParticleItem> = {
		name: level,
		version: 3,
		title: { en: level },
		tags: [],
		author: { en: "Rizline" },
		subtitle: { en: "" },
	}

	const particleData = readFileSync(
		"./convert/particle/data.json",
		"utf8"
	).replace(/ColorTheme(\d+)/g, (match, number) => {
		const themeIndex = Number.parseInt(number)
		const theme = converted.info.themes[themeIndex]
		return theme ? hexColor(theme.colorsList[2]) : match
	})

	writeFileSync(
		`${particlePath}item.json`,
		JSON.stringify(paricleItem, null, 2)
	)
	writeFileSync(`${particlePath}data.json`, particleData)
	copyFileSync("./convert/particle/texture.png", `${particlePath}texture.png`)
	copyFileSync(`${levelPath}cover.png`, `${particlePath}thumbnail.png`)
})
