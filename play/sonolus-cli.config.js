import { copyFileSync, readFileSync } from 'node:fs'
import { levelList } from "../shared/src/assets/level_list.ts"

/** @type {import('@sonolus/sonolus.js').SonolusCLIConfig} */
export default {
  type: 'play',

  devServer(sonolus) {
    //kinda useless code to easely switch between levels while testing
    const rizLevel = levelList[2]
    const level = sonolus.level.items[0]

    level.title = { en: rizLevel.title }
    level.description = { en: '' }
    level.artists = { en: rizLevel.artist }
    level.author = { en: rizLevel.chart_hd.charter }
    level.rating = rizLevel.chart_hd.difficulty

    copyFileSync(`./shared/src/assets/covers/${rizLevel.illustration_id}.png`, `./.dev/${rizLevel.illustration_id}.png`)
    level.cover = { hash: `1f61011aed76593798d6d9f9585a7115988c6fa`, url: `/${rizLevel.illustration_id}.png` }

    copyFileSync(`./shared/src/assets/songs/${rizLevel.music_id}.mp3`, `./.dev/${rizLevel.music_id}.mp3`)
    level.bgm = { hash: `dbe1aa285c6922875a4571208e1a8410996a911`, url: `/${rizLevel.music_id}.mp3` }

    copyFileSync(`./shared/src/assets/charts/${rizLevel.chart_hd.id}.json`, `./shared/src/level/data/chart.json`)
  }

}
