import { archetypes } from "."

export class Initialization extends Archetype {
  preprocess() {
    const topPadding = 0.01
    ui.menu.set({
      anchor: screen.rect.lt.add(new Vec(0.075 + topPadding, -0.075 - 0.15 * ui.configuration.menu.scale)),
      pivot: { x: 0, y: 1 },
      size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
      rotation: 90,
      alpha: ui.configuration.menu.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: true,
    })
    ui.metric.primary.bar.set({
      anchor: screen.rect.lb.add(new Vec(0.075 + topPadding, 0.075)),
      pivot: { x: 0, y: 1 },
      size: new Vec(screen.h - (0.2 + 0.15 * ui.configuration.menu.scale), 0.15 * ui.configuration.metric.primary.scale),
      rotation: 90,
      alpha: ui.configuration.metric.primary.alpha,
      horizontalAlign: HorizontalAlign.Left,
      background: true,
    }),
      ui.metric.primary.value.set({
        anchor: screen.rect.lb.add(new Vec(0.075 + topPadding + 0.15 / 4 * ui.configuration.metric.primary.scale, 0.075 + 0.2 * ui.configuration.metric.primary.scale)),
        pivot: { x: 0, y: 1 },
        size: new Vec(screen.h - (0.2 + 0.05 * ui.configuration.menu.scale), 0.075 * ui.configuration.metric.primary.scale),
        rotation: 90,
        alpha: ui.configuration.metric.primary.alpha,
        horizontalAlign: HorizontalAlign.Left,
        background: false,
      }),
      ui.judgment.set({
        anchor: screen.rect.cl.add(new Vec(0.3 + topPadding, -0 * ui.configuration.judgment.scale)),
        pivot: { x: 0, y: 1 },
        size: new Vec(0, 0.1).mul(ui.configuration.judgment.scale),
        rotation: 90,
        alpha: ui.configuration.judgment.alpha,
        horizontalAlign: HorizontalAlign.Center,
        background: false,
      })
    ui.combo.value.set({
      anchor: screen.rect.lt.add(new Vec(0.3 + topPadding, -0.075)),
      pivot: { x: 0, y: 1 },
      size: new Vec(0, 0.15).mul(ui.configuration.combo.scale),
      rotation: 90,
      alpha: ui.configuration.menu.alpha,
      horizontalAlign: HorizontalAlign.Right,
      background: false,
    })

    life.consecutive.perfect.set({
      increment: 50,
      step: 10,
    })

    for (const archetype of Object.values(archetypes)) {
      if (!('globalPreprocess' in archetype)) continue

      archetype.globalPreprocess()
    }
  }

  spawnOrder() {
    return 0
  }

  updateSequential() {
    this.despawn = true
    archetypes.InputManager.spawn({})
  }
}
