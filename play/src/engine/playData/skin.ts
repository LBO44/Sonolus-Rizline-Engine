import { SkinSpriteName } from "@sonolus/core";

export const skin = defineSkin({
  renderMode: "default",
  sprites: {

    //background
    backgroundNormal: "Background Normal",
    backgroundChallenge: "Background Challenge",


    //note
    noteTapNormal: "Tap Note Normal",
    noteTapChallenge: "Tap Note Challenge",

    noteDrag: "Drag Note",

    noteHold: "Hold Note",
    noteHoldStartNormal: "Hold Start Normal",
    noteHoldStartChallenge: "Hold Start Challenge",
    noteHoldConnectorNormal: "Hold Connector Normal",
    noteHoldConnectorChallenge: "Hold Connector Challenge",

    //lines
    line0: "L0",
    ...Object.fromEntries(
      Array.from({ length: 31 /* number of lines available in skin*/ }, (_, i) => [`line${i + 1}`, `L${i + 1}`])
    ),

    //JudgeRings
    judgeRing0: "J0",
    ...Object.fromEntries(
      Array.from({ length: 31 }, (_, i) => [`judgeRing${i + 1}`, `J${i + 1}`])
    )
  },
})
