import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import levelList from "../shared/rizlineAssets/level_list.json" with { type: "json" }

/** @type {import('@sonolus/sonolus.js').SonolusCLIConfig} */
export default {
  type: 'play',

  devServer(sonolus) {
    process.env.MODE = this.mode
    const shouldCopyAssets = !existsSync("./.dev/assets")
    if (shouldCopyAssets) mkdirSync("./.dev/assets")

    levelList.forEach((rizLevel, i) => {

      /** @type {import('@sonolus/express').LevelItemModel} */
      let level = { ...sonolus.level.items[0] }

      level.name = rizLevel.level_id
      level.title = { en: rizLevel.title }
      level.description = { en: '' }
      level.artists = { en: rizLevel.artist }
      level.author = { en: rizLevel.chart_hd.charter }
      level.rating = rizLevel.chart_hd.difficulty
      level.useSkin = { useDefault: false, item: "pixel" } //pixel skin won't work with the engine


      if (shouldCopyAssets) copyFileSync(`./shared/rizlineAssets/covers/${rizLevel.illustration_id}.png`, `./.dev/assets/${rizLevel.illustration_id}.png`)
      level.cover = { url: `/assets/${rizLevel.illustration_id}.png`, hash: rizLevel.coverHash }

      if (shouldCopyAssets) copyFileSync(`./shared/rizlineAssets/songs/${rizLevel.music_id}.mp3`, `./.dev/assets/${rizLevel.music_id}.mp3`)
      level.bgm = { url: `/assets/${rizLevel.music_id}.mp3`, hash: rizLevel.bgmHash }
      level.data = { url: `/level/${rizLevel.level_id}` }

      i == 0 ? sonolus.level.items[0] = level : sonolus.level.items.push(level)
    })

  }

}
