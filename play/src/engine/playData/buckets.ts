import { Text } from "@sonolus/core";
import { skin } from "./skin";

export const buckets = defineBuckets({
  TapNote: {
    sprites: [
      {
        id: skin.sprites.noteTapNormal.id,
        x: -2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteTapChallenge.id,
        x: 2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  },
  HoldNoteStart: {
    sprites: [
      {
        id: skin.sprites.noteHold.id,
        x: -2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteHoldStartNormal.id,
        x: -2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },

      {
        id: skin.sprites.noteHold.id,
        x: 2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteHoldStartChallenge.id,
        x: 2,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
    ],
    unit: Text.MillisecondUnit
  },
  HoldNoteEnd: {
    sprites: [
      {
        id: skin.sprites.noteHoldConnectorNormal.id,
        x: -2.25,
        y: 0,
        w: 1,
        h: 2,
        rotation: 0,
      }, {
        id: skin.sprites.noteHoldStartNormal.id,
        x: -1.25,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteHoldConnectorChallenge.id,
        x: 1.25,
        y: 0,
        w: 1,
        h: 2,
        rotation: 0,
      },
      {
        id: skin.sprites.noteHoldStartChallenge.id,
        x: 2.25,
        y: 0,
        w: 2,
        h: 2,
        rotation: 0,
      },
    ],
    unit: Text.MillisecondUnit
  },
  DragNote: {
    sprites: [
      {
        id: skin.sprites.noteDrag.id,
        x: 0,
        y: 0,
        w: 1.5,
        h: 1.5,
        rotation: 0,
      }
    ],
    unit: Text.MillisecondUnit
  }
})
