import { copyFileSync, existsSync, mkdirSync } from "fs"
import levelList from "../rizlineAssets/level_list.json" with { type: "json" }

/** @type NonNullable<import("@sonolus/sonolus.js").SonolusCLIConfig["devServer"]> */
export const devServer = (sonolus) => {

  process.env.MODE = "dev"
  if (!existsSync("./.dev")) mkdirSync("./.dev")
  if (!existsSync("./.dev/assets")) mkdirSync("./.dev/assets")
  if (!existsSync("./.dev/level")) mkdirSync("./.dev/level")
  if (!existsSync("./.dev/skin")) mkdirSync("./.dev/skin")

  const skinDataSrl = sonolus.add("./lib/skin/skinData")

  levelList.forEach((rizLevel, i) => {

    /** @type import("@sonolus/express").LevelItemModel*/
    let level = { ...sonolus.level.items[0] }

    level.name = rizLevel.level_id
    level.title = { en: rizLevel.title }
    level.description = { en: '' }
    level.artists = { en: rizLevel.artist }
    level.author = { en: rizLevel.chart_hd.charter }
    level.rating = rizLevel.chart_hd.difficulty
    level.useSkin = { useDefault: false, item: rizLevel.chart_hd.id }


    copyFileSync(`./shared/rizlineAssets/covers/${rizLevel.illustration_id}.png`, `./.dev/assets/${rizLevel.illustration_id}.png`)
    level.cover = { url: `/assets/${rizLevel.illustration_id}.png`, hash: rizLevel.coverHash }

    copyFileSync(`./shared/rizlineAssets/songs/${rizLevel.music_id}.mp3`, `./.dev/assets/${rizLevel.music_id}.mp3`)
    level.bgm = { url: `/assets/${rizLevel.music_id}.mp3`, hash: rizLevel.bgmHash }
    level.data = { url: `/level/${rizLevel.level_id}` }

    i == 0 ? sonolus.level.items[0] = level : sonolus.level.items.push(level)

    let skin = { ...sonolus.skin.items[0] }
    skin.name = rizLevel.chart_hd.id
    skin.title = { en: rizLevel.title }
    skin.subtitle = { en: "" }
    skin.author = { en: rizLevel.chart_hd.charter }
    skin.thumbnail = { url: `/assets/${rizLevel.illustration_id}.png`, hash: rizLevel.coverHash }
    skin.data = skinDataSrl
    skin.texture = { url: `/skin/${rizLevel.chart_hd.id}.png` }

    console.log(level)
    sonolus.skin.items.push(skin)
  })
}

