import { Text } from "@sonolus/core";
import { skin } from "./skin";

export const buckets = defineBuckets({
  TapNote: {
    sprites: [
      {
        id: skin.sprites.noteTapNormal.id,
        x: -0.5,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteTapChallenge.id,
        x: 0.5,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  },
  HoldNote: {
    sprites: [
      {
        id: skin.sprites.noteHold.id,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  },
  DragNote: {
    sprites: [
      {
        id: skin.sprites.noteDrag.id,
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
