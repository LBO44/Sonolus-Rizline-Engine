import { SkinSpriteName } from "@sonolus/core";

export const skin = defineSkin({
  renderMode: "standard",
    sprites: {

    //line
    lineNeutral: SkinSpriteName.GridNeutral,
    lineRed: SkinSpriteName.GridRed,
    lineBlue: SkinSpriteName.GridBlue,
    lineGreen: SkinSpriteName.GridGreen,

    //note
    noteTap: SkinSpriteName.NoteHeadBlue,
    noteTapChallenge: SkinSpriteName.NoteHeadBlue,

    noteCatch: SkinSpriteName.NoteTailGreen,
    noteCatchChallenge: SkinSpriteName.NoteTailBlue,

    noteHoldStart: SkinSpriteName.NoteHeadPurple,
    noteHoldMiddle: SkinSpriteName.NoteConnectionRedSeamless,
    noteHoldEnd: SkinSpriteName.NoteTailNeutral,

    //Judge Ring
    JudgeRingNeutral: SkinSpriteName.NoteConnectionNeutral,
    judgeRingRed: SkinSpriteName.NoteTailRed,
    judgeRingBlue: SkinSpriteName.NoteTailBlue,
    judgeRingGreen: SkinSpriteName.NoteHeadGreen,
  },
})
