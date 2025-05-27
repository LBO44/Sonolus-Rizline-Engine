import { LevelData, SkinDataSprite } from '@sonolus/core'
import { readFileSync, statSync, writeFileSync } from 'fs'
import path from 'path'
import { gzipSync, unzipSync } from 'zlib'
import { colorizeSkin, chartInfoToSpritesColors } from "../../../../lib/skin/edit_skin"
import { convertsChart, RizChart } from '../../../../lib/chart_converter'
import levelList from "../../../rizlineAssets/level_list.json"

export const BasicData: LevelData = { bgmOffset: 0, entities: [] }

if (process.env.MODE === "dev") {

  //Dirty way of only updating levels and skins when level converter was modified
  const shouldUpdate = (Date.now() - statSync("./lib/chart_converter.ts").mtimeMs < 1000)
  if (shouldUpdate) {

    const baseSkinData: SkinDataSprite[] = JSON.parse(unzipSync(readFileSync("./lib/skin/skinData")).toString()).sprites

    console.time("Converting levels")

    levelList.forEach(level => {

      const chart: RizChart = JSON.parse(readFileSync(path.join(process.cwd(), `./shared/rizlineAssets/charts/${level.chart_hd.id}.json`), "utf8"))
      const converted = convertsChart(chart)


      const skinPath = `./.dev/skin/${level.chart_hd.id}.png`
      const spritesColors = chartInfoToSpritesColors(converted.info)
      colorizeSkin("./lib/skin/SkinBaseTexture.png", baseSkinData, spritesColors, skinPath)


      writeFileSync(path.join(process.cwd(), `./.dev/level/${level.level_id}`),
        gzipSync(JSON.stringify(converted.data, null, 2))
      )
    })

    console.timeEnd("Converting levels")
  }
}
