import { EffectClipName } from "@sonolus/core";

export const effect = defineEffect({
    clips: {
        Tap: EffectClipName.Perfect, //also used for Hold start
        Drag: EffectClipName.Great
    },
})
