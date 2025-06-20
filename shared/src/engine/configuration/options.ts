import { EngineConfigurationOption, Text } from '@sonolus/core'

export const optionsDefinition = {
  speed: {
    name: Text.Speed,
    standard: true,
    advanced: true,
    type: 'slider',
    def: 1,
    min: 0.5,
    max: 2,
    step: 0.01,
    unit: Text.PercentageUnit,
  },
  noteSpeed: {
    name: Text.NoteSpeed,
    min: 1,
    max: 10,
    def: 3,
    type: "slider",
    step: 0.1,
    scope: "Rizline",
  },
  mirror: {
    name: Text.Mirror,
    type: 'toggle',
    def: 0,
  },
  noteSize: {
    name: Text.NoteSize,
    min: 0.1,
    max: 2,
    def: 1,
    type: "slider",
    step: 0.05,
    scope: "Rizline",
    unit: Text.PercentageUnit
  },
  missEffect: {
    name: "Show Miss Effect",
    type: "toggle",
    def: 1,
    scope: "Rizline",
  },
  backgroundOpacity: {
    name: "Colour Background Opacity",
    type: "slider",
    def: 1,
    min: 0,
    max: 1,
    step: 0.05,
    description: "In case you want to use a custom background.",
    scope: "Rizline",
    unit: Text.PercentageUnit
  }
} satisfies Record<string, EngineConfigurationOption>
