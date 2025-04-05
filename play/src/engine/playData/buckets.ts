import { Text } from "@sonolus/core";
import { skin } from "./skin";

export const buckets = defineBuckets({
  TapNote: {
    sprites: [
      {
        id: skin.sprites.noteTap.id,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  },
  CatchNote: {
    sprites: [
      {
        id: skin.sprites.noteCatch.id,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  }
})
