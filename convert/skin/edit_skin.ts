import { readFileSync, writeFileSync } from "fs"
import type { SkinDataSprite } from "@sonolus/core"
import { PNG } from "pngjs"
import { type convertedChartInfo, hexColor } from "../chart_converter"

function hexToRgb(hex: string) {
	const r = Number.parseInt(hex.slice(1, 3), 16)
	const g = Number.parseInt(hex.slice(3, 5), 16)
	const b = Number.parseInt(hex.slice(5, 7), 16)
	return { r, g, b }
}

export const chartInfoToSpritesColors = (
	info: convertedChartInfo
): Record<string, string> => {
	const themeSpriteColours = info.themes.reduce((acc, theme, index) => {
		acc[`Background Theme ${index}`] = hexColor(theme.colorsList[0])
		acc[`Background Circle Theme ${index}`] = hexColor(theme.colorsList[0])
		acc[`Fade Out Theme ${index}`] = hexColor(theme.colorsList[0])
		acc[`Judge Ring Background Theme ${index}`] = hexColor(theme.colorsList[0])
		acc[`Tap Note Theme ${index}`] = hexColor(theme.colorsList[1])
		acc[`Hold Connector Theme ${index}`] = hexColor(theme.colorsList[1])
		acc[`Hold Connector Fade Out Theme ${index}`] = hexColor(theme.colorsList[1])
		acc[`UI Background Theme ${index}`] = hexColor(theme.colorsList[2])
		return acc
	}, {})

	return {
		...themeSpriteColours,
		...Object.fromEntries(
			info.lineColors.map((c, i) => [`Line Color ${i}`, c])
		),
		...Object.fromEntries(
			info.lineColors.map((c, i) => [`Line Disc Color ${i}`, c])
		),
		...Object.fromEntries(
			info.judgeRingColors.map((c, i) => [`Judge Ring Color ${i}`, c])
		),
	}
}

export const colorizeSkin = (
	baseTexturePath: string,
	spritesData: SkinDataSprite[],
	spriteColors: Record<string, string>,
	outputPath: string
) => {
	const baseTexture = PNG.sync.read(readFileSync(baseTexturePath))

	for (const entry of spritesData) {
		const hex = spriteColors[entry.name]
		if (!hex) continue

		const { r: tintR, g: tintG, b: tintB } = hexToRgb(hex)

		for (let y = -1; y <= entry.h; y++) {
			for (let x = -1; x <= entry.w; x++) {
				const globalX = entry.x + x
				const globalY = entry.y + y
				const idx = (baseTexture.width * globalY + globalX) << 2

				const r = baseTexture.data[idx]
				const g = baseTexture.data[idx + 1]
				const b = baseTexture.data[idx + 2]
				const a = baseTexture.data[idx + 3]

				// Better to tint slightly grey pixels just in case
				// need to tint invisible pixels too because of sonolus rgb interpolation
				if (a === 0 || (r > 100 && g > 100 && b > 100)) {
					baseTexture.data[idx] = Math.round(tintR)
					baseTexture.data[idx + 1] = Math.round(tintG)
					baseTexture.data[idx + 2] = Math.round(tintB)
				}
			}
		}
	}

	writeFileSync(outputPath, PNG.sync.write(baseTexture))
}
