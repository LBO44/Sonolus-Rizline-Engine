import { LevelData } from '@sonolus/core'
import { convertsChart } from './convert'
import fs from 'fs'

const chart = JSON.parse(fs.readFileSync("./shared/src/level/data/chart.json","utf8"))

export const data:LevelData = convertsChart(chart)
  //write the file for debugging purposes
  fs.writeFile("./shared/src/level/data/converted_chart.json", JSON.stringify(data, null, 2), err => { if (err) console.error(err) })

