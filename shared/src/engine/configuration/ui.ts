import { EngineConfigurationUI } from '@sonolus/core'

export const ui: EngineConfigurationUI = {
  primaryMetric: 'life',
  secondaryMetric: 'accuracy',
  menuVisibility: {
    scale: 1,
    alpha: 1,
  },
  judgmentVisibility: {
    scale: 1,
    alpha: 1,
  },
  comboVisibility: {
    scale: 1,
    alpha: 1,
  },
  primaryMetricVisibility: {
    scale: 1,
    alpha: 1,
  },
  secondaryMetricVisibility: {
    scale: 1,
    alpha: 1,
  },
  progressVisibility: {
    scale: 1,
    alpha: 1,
  },
  tutorialNavigationVisibility: {
    scale: 1,
    alpha: 1,
  },
  tutorialInstructionVisibility: {
    scale: 1,
    alpha: 1,
  },
  judgmentAnimation: {
    scale: {
      from: 0.6,
      to: 1,
      duration: 0.1,
      ease: 'inSine',
    },
    alpha: {
      from: 0.6,
      to: 1,
      duration: 0.1,
      ease: 'inSine',
    },
  },
  comboAnimation: {
    scale: {
      from: 0.6,
      to: 1,
      duration: 0.1,
      ease: 'inSine',
    },
    alpha: {
      from: 0.6,
      to: 1,
      duration: 0.1,
      ease: 'linear',
    },
  },
  judgmentErrorStyle: 'late',
  judgmentErrorPlacement: 'bottom',
  judgmentErrorMin: 10,
}
