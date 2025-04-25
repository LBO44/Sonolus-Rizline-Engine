import { SkinSpriteName } from "@sonolus/core";

export const skin = defineSkin({
  renderMode: "standard",
  sprites: {

    //note
    noteTap: "Tap Note Normal",
    noteTapChallenge: "Tap Note Challenge",

    noteTouch: "Touch Note",

    noteHoldStart: "Hold Note",
    noteHold: "Hold Trail Normal",
    noteHoldChallenge: "Hold Trail Challenge",

    //Judge Ring
    JudgeRing: "Judge Ring",

    //lines
    Line0: "L0",
    ...Object.fromEntries(
      Array.from({ length: 30 /* number of lines available in skin*/ }, (_, i) => [`Line${i + 1}`, `L${i + 1}`])
    )
  },
})
