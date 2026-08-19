import { readFileSync, writeFileSync } from "fs"
import type { SkinDataSprite } from "@sonolus/core"
import { PNG } from "pngjs"
import { type convertedChartInfo, hexColor, hexToRgb } from "../chart_converter.js"


export const chartInfoToSpritesColors = (
	info: convertedChartInfo
): Record<string, string> => {
	const mappings: Array<[colors: string[], prefixes: string[]]> = [
		[info.backgroundElementColors, ["Background Half Disc Color", "Fade Out Color"]],
		[info.noteColors, ["Tap Note Color", "Hold Connector Color", "Hold Connector Fade Out Color"]],
		[info.judgeRingColors, ["Judge Ring Color"]],
		[info.pixelColors, ["Pixel Color", "Line Disc Color"]],
	]

	const spriteColors: Record<string, string> = {}

	for (const [colors, prefixes] of mappings) {
		colors.forEach((color, index) => {
			prefixes.forEach((prefix) => {
				spriteColors[`${prefix} ${index}`] = color
			})
		})
	}

	return spriteColors
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
