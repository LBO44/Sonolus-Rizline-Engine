![Banner Image](https://github.com/user-attachments/assets/f346d82d-f1fb-4ce0-92cd-85b346e374bf)
<h1 align=center>sonolus Rizline Engine</h1>
<p align="center">My attempt at recreating <b>Rizline</b> in <a href="https://sonolus.com/">Sonolus</a> using <a href="https://github.com/Sonolus/sonolus.js">Sonolus.js</a>.</p>

## Todo List
- [ ] Play Mode & General:
  - [x] Correct line shape
  - [ ] JudgeRing colours
  - [ ] Line colour
  - [x] Tap/Drag notes
  - [ ] Hold notes
  - [ ] Various configuration options
  - [ ] Adapt Rizline judgement and scoring
  - [ ] Proper UI
  - [ ] Particles
- [ ] Watch Mode
- [ ] Tutorial Mode
- [ ] Preview Mode

## Custom Resources

### Skin Sprites
Since Sonolus doesn't have any way of drawing sprites with a custom colour, we need to generate and use a different skin texture for each level to match Rizline's levels colours.
Currently [pngjs](https://github.com/pngjs/pngjs) is used to automatically recolour the skin texture according to the level's colours. During chart conversion, each Line and JudgeRing's unique colour (alpha not considered) is assigned a unique ID used by the engine to choose which sprite to draw.

| Name                                                          |
| ------------------------------------------------------------- |
| `Background Normal`                                           |
| `Background Challenge`                                        |
| `Tap Note Normal`                                             |
| `Tap Note Challenge`                                          |
| `Drag Note`                                                   |
| `Hold Note`                                                   |
| `Hold Start Normal`                                           |
| `Hold Start Challenge`                                        |
| `Hold Connector Normal`                                       |
| `Hold Connector Challenge`                                    |
| `L0`,`L1`,…,`L29` (One sprite for each **Line** colour.)      |
| `J0`,`J1`,…,`J29` (One sprite for each **JudgeRing** colour.) |

### Effect Clips
Default Sonolus effect names are used, however only `#PERFECT` (for Tap and Hold Start notes) and `#GREAT` (for Drag notes) are used.

## Links
- [Rhythm Game Wiki: Rizline](https://rgwiki.stary.pc.pl/wiki/Rizline), it helped me a lot with understanding Rizline chart files and mechanisms.
- [Rizlib](https://gitlab.com/TadeLn/rizlib), Rust library to interact with the game files.
- [Sonolus Website](https://sonolus.com/)
- [Sonolus Wiki](https://github.com/NonSpicyBurrito/sonolus-wiki)
- This repository is based on [Sonolus.js Template (TS)](https://github.com/Sonolus/sonolus.js-template-ts)