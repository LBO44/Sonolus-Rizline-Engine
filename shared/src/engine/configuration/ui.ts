import { EngineConfigurationUI } from '@sonolus/core'

export const ui: EngineConfigurationUI = {
  primaryMetric: 'arcade',
  secondaryMetric: 'life',
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
      from: 0.75,
      to: 1.75,
      duration: 0.4,
      ease: 'outSine',
    },
    alpha: {
      from: 0,
      to: 1,
      duration: 0.7,
      ease: 'outSine',
    },
  },
  comboAnimation: {
    scale: {
      from: 0.75,
      to: 1.75,
      duration: 0.4,
      ease: 'outSine',
    },
    alpha: {
      from: 0,
      to: 1,
      duration: 0.7,
      ease: 'outSine',
    },
  },
  judgmentErrorStyle: 'none',
  judgmentErrorPlacement: 'center',
  judgmentErrorMin: 0,
}
