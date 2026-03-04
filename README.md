<h1 align=center>Sonolus Rizline Engine</h1>

![Banner Image](https://github.com/user-attachments/assets/f346d82d-f1fb-4ce0-92cd-85b346e374bf)
<p align="center">My recreation of <b>Rizline</b> in <a href="https://sonolus.com/">Sonolus</a> using <a href="https://sonolus.py.qwewqa.xyz/">Sonolus.py</a>.</p>

**Try it now at: https://sonolus-rizline.vercel.app/ !**
Currently featuring *fully working* play and watch mode, plus a simple tutorial.

## Quick Dev Setup
1. Install [uv](https://docs.astral.sh/uv/), run `uv sync` in the project folder.
2. To add Rizline levels, copy one of the existing `resources/levels/...` folder, modify `item.json` with the new level name (modify the particle and skin too) and change `chart.json` to the corresponding Rizline chart file.
3. Convert Rizline chart to Sonolus data and generate corresponding skin and particle by running `npx -p pngjs tsx convert/generate_resources.ts`, [pngjs](https://www.npmjs.com/package/pngjs) is used to generate skin textures.
4. [Ensure your venv is activated](https://docs.astral.sh/uv/pip/environments/#using-a-virtual-environment).
5. Run `sonolus-py dev`.

## Development Notes
<details>
<summary>Random facts on how I made the engine.</summary>

This is the first Sonolus engine requiring per level skin and particle, as Rizline have different colours (background, lines, notes…) in each level and Sonolus doesn't support drawing sprites with arbitrary colours.
At first I was considering drawing custom colours by layering transparent red, green, blue sprites to only have one global skin, but the colours would have been inaccurate and it would have a had a non negligible performance impact.
Currently each colour has its own sprite, making rendering *simple* (well, Rizline gradients aren't that simple) and efficient.

Rizline lines 19 easing types are stored as integer in the chart files, figuring out what they correspond to wasn't straightforward and required lots of trials and errors.
I ended up injecting custom code in the game that calls Rizline's internal `getEaseWithProgress` function and logs the results so that I could plot and compare them to the common easing types, it took a while.
Now that info is freely given in the chart editor. 😔

I've always used judgement windows/hit timings from rizwiki.cn, turns out they were apparently inaccurate and way too strict, they [updated the page](https://rizwiki.cn/index.php?title=机制&diff=prev&oldid=9149) when the PC version released. 😅

I first started recreating Rizline using sonolus.js (you can check that code in [its branch](https://github.com/LBO44/Sonolus-Rizline-Engine/tree/outdated-sonolus-js-version), however back then I didn't really know how Rizline worked and sonolus.js had significant issues such as extremely long compiling time, impacting development. Since the engine wasn't really working and I didn't like how I made some stuff, I decided to start again in sonolus.py which is overall much better and made development significantly easier!
</details>

## Custom Resources

### Skin Sprites
Some sprites have variation for normal and challenge time/riztime, each challenge time can have different colour, the engine and skin support up to 8 colours.
For exemple, `Background Theme 0` has the non-challenge time colour, `Background Theme 1` has the colour of first challenge time…

| Name                                  |
| ------------------------------------- |
| `Background Theme [0-7]`              |
| `Background Circle Theme [0-7]`       |
| `Fade Out Theme [0-7]`                |
| `Drag Note`                           |
| `Hold Note`                           |
| `Tap Note Theme [0-7]`                |
| `Hold Head Theme [0-7] `              |
| `Hold Head Decorator Theme [0-7]`     |
| `Hold Connector Theme [0-7]`          |
| `Hold Connector Fade Out Theme [0-7]` |
| `Miss Effect Overlay`                 |
| `Miss Effect Cross`                   |
| `Line Color [0-61]`                   |
| `Judge Ring Color [0-31]`             |
| `Judge Ring Background Theme [0-7]`   |

### Particles
Unlike with Skin we can change the colours by only modifying the data.

| Name                        |
| --------------------------- |
| `Hit Theme [0-7]`           |
| `Hit Extension Theme [0-7]` |
| `Bad`                       |

### Effect Clips
Default Sonolus effect names are used, however only `#PERFECT` (for Tap and Hold Start notes) and `#GREAT` (for Drag notes) are used.

## Links
- [Rizwiki.cn](https://rizwiki.cn/index.php), for detailed gameplay mechanics descriptions.
- [Rhythm Game Wiki: Rizline](https://rgwiki.stary.pc.pl/wiki/Rizline), useful informations about Rizline files.
- [Rizlib](https://gitlab.com/TadeLn/rizlib), Rust library to interact with the game files.
- [Sonolus Website](https://sonolus.com)
- This repository is based on [Sonolus.py Template](https://github.com/qwewqa/sonolus.py-template-project)
