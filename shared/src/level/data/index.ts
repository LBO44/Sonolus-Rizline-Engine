import { LevelData } from '@sonolus/core'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { gzipSync } from 'zlib'
import { convertsChart, RizChart } from '../../../../lib/chart_converter'
import levelList from "../../../rizlineAssets/level_list.json"

export const BasicData: LevelData = { bgmOffset: 0, entities: [] }

if (process.env.MODE === "dev") {

  console.time("Converting levels")
  levelList.forEach(level => {

    const chart: RizChart = JSON.parse(readFileSync(path.join(process.cwd(), `./shared/rizlineAssets/charts/${level.chart_hd.id}.json`), "utf8"))
    const data = convertsChart(chart).data

    writeFileSync(path.join(process.cwd(), `./.dev/level/${level.level_id}`),
      gzipSync(JSON.stringify(data, null, 2))
    )
  })

  console.timeEnd("Converting levels")
}
