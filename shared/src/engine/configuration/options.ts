import { EngineConfigurationOption } from '@sonolus/core'

export const optionsDefinition = {
  speed: {
    name: "#SPEED",
    standard: true,
    advanced: true,
    type: 'slider',
    def: 1,
    min: 0.5,
    max: 2,
    step: 0.01,
    unit: "#PERCENTAGE_UNIT",
  },
  NoteSpeed: {
    name: "#NOTE_SPEED",
    min: 1,
    max: 10,
    def: 3,
    type: "slider",
    step: 0.1,
    scope: "Rizline",
  },
  NoteSize: {
    name: "#NOTE_SIZE",
    min: 0.1,
    max: 2,
    def: 1,
    type: "slider",
    step: 0.05,
    scope: "Rizline",
    unit: "#PERCENTAGE_UNIT"
  },
  MissEffect: {
    name: "Show Miss Effect",
    type: "toggle",
    def: 1,
    scope: "Rizline",
  }
} satisfies Record<string, EngineConfigurationOption>
