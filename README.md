<h1 align=center>Sonolus Rizline Engine</h1>

![Banner Image](https://github.com/user-attachments/assets/f346d82d-f1fb-4ce0-92cd-85b346e374bf)
<p align="center">My recreation of <b>Rizline</b> in <a href="https://sonolus.com/">Sonolus</a> using <a href="https://sonolus.py.qwewqa.xyz/">Sonolus.py</a>.</p>

**Try it now at: https://sonolus-rizline.vercel.app/ !**
Currently featuring play and watch mode.

## Quick Dev Setup
1. Install [uv](https://docs.astral.sh/uv/), run `uv sync`.
2. To add Rizline levels, copy one of the existing `resources/levels` folder, modify `item.json` with the new level name and change `chart.json` to the corresponding Rizline chart file.
3. Convert Rizline chart to Sonolus data and generate corresponding skin and particle by running `convert/generate_resources.ts`, [pngjs](https://www.npmjs.com/package/pngjs) is used to generate skin textures.
4. [Ensure your venv is activated](https://docs.astral.sh/uv/pip/environments/#using-a-virtual-environment).
5. Run `sonolus-py dev`.


## Custom Resources

### Skin Sprites
Since Sonolus doesn't have any way of drawing sprites with a custom colour, we need to generate and use a different skin texture for each level to match Rizline's levels colours.
Some sprites have variation for normal and challenge time, like `Background Normal` | `Background Challenge`

| Name                                            |
| ----------------------------------------------- |
| `Background Normal` \| `Challenge`              |
| `Background Circle Normal` \| `Challenge`       |
| `Fade Out Spawn`                                |
| `Fade Out Judge`                                |
| `Drag Note`                                     |
| `Hold Note`                                     |
| `Tap Note Normal` \| `Challenge`                |
| `Hold Head Normal` \| `Challenge`               |
| `Hold Head Decorator Normal` \| `Challenge`     |
| `Hold Connector Normal` \| `Challenge`          |
| `Hold Connector Fade Out Normal` \| `Challenge` |
| `Miss Effect Overlay`                           |
| `Miss Effect Cross`                             |
| `Line Color 0`, …,`Line Color 31`               |
| `Judge Ring Color 0`, …, `Judge Ring Color 31`  |
| `Judge Ring Background`                         |
| `Line Background`                               |

### Particles
Unlike with Skin we can change the colours by only modifying the data.

| Name                            |
| ------------------------------- |
| `Hit Normal` \| `Hit Challenge` |
| `Hit Challenge Extension`       |
| `Bad`                           |

### Effect Clips
Default Sonolus effect names are used, however only `#PERFECT` (for Tap and Hold Start notes) and `#GREAT` (for Drag notes) are used.

## Links
- [Rhythm Game Wiki: Rizline](https://rgwiki.stary.pc.pl/wiki/Rizline), useful informations about Rizline files.
- [Rizlib](https://gitlab.com/TadeLn/rizlib), Rust library to interact with the game files.
- [Sonolus Website](https://sonolus.com/)
- This repository is based on [Sonolus.py Template](https://github.com/qwewqa/sonolus.py-template-project)
