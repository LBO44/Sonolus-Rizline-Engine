import { SkinDataSprite } from '@sonolus/core'
import fs from 'fs'
import { PNG } from 'pngjs'
import { chartInfo, hexColor } from "../chart_converter"

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export const chartInfoToSpritesColors = (info: chartInfo): Record<string, string> => {
  return {
    "Background Normal": hexColor(info.themes[0].colorsList[0]),
    "Background Challenge": hexColor(info.themes[1].colorsList[0]),
    "Tap Note Normal": hexColor(info.themes[0].colorsList[1]),
    "Tap Note Challenge": hexColor(info.themes[1].colorsList[1]),
    "Hold Start Normal": hexColor(info.themes[0].colorsList[1]),
    "Hold Start Challenge": hexColor(info.themes[1].colorsList[1]),
    "Hold Connector Normal": hexColor(info.themes[0].colorsList[1]),
    "Hold Connector Challenge": hexColor(info.themes[1].colorsList[1]),
    ...Object.fromEntries(
      info.lineColors.map((c, i) => [`L${i}`, c])
    ),
    ...Object.fromEntries(
      info.judgeRingColors.map((c, i) => [`J${i}`, c])
    )
  }
}

export const colorizeSkin = (
  baseTexturePath: string,
  spritesData: SkinDataSprite[],
  spriteColors: Record<string, string>,
  outputPath: string
) => {
  const baseTexture = PNG.sync.read(fs.readFileSync(baseTexturePath))

  for (let entry of spritesData) {
    const hex = spriteColors[entry.name]
    if (!hex) continue

    const { r: tintR, g: tintG, b: tintB } = hexToRgb(hex);

    for (let y = -1; y <= entry.h; y++) {
      for (let x = -1; x <= entry.w; x++) {
        const globalX = entry.x + x;
        const globalY = entry.y + y;
        const idx = (baseTexture.width * globalY + globalX) << 2;

        const r = baseTexture.data[idx];
        const g = baseTexture.data[idx + 1]
        const b = baseTexture.data[idx + 2]
        const a = baseTexture.data[idx + 3]

        if (a === 0) continue;

        // Replace only white-ish pixels
        if (r > 100 && g > 100 && b > 100) {

          baseTexture.data[idx] = Math.round(tintR)
          baseTexture.data[idx + 1] = Math.round(tintG)
          baseTexture.data[idx + 2] = Math.round(tintB)
        }
      }
    }
  }

  fs.writeFileSync(outputPath, PNG.sync.write(baseTexture))
}
