import { ParticleEffectName } from "@sonolus/core";

export const particle = defineParticle({
    effects: {
        noteNormal: ParticleEffectName.NoteCircularTapBlue,
        noteChallenge: ParticleEffectName.NoteCircularTapRed,
        noteChalleneeExtended: ParticleEffectName.NoteLinearTapRed,
    },
})
