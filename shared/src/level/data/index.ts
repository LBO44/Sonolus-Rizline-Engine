import { LevelData } from '@sonolus/core'
import { convertsChart } from '../../../../lib/chart_converter'
import fs from 'fs'
import chart from "./chart.json"

export const data:LevelData = convertsChart(chart)
  //write the file for debugging purposes
  fs.writeFile("./shared/src/level/data/converted_chart.json", JSON.stringify(data, null, 2), err => { if (err) console.error(err) })

