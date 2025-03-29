export class Initialization extends Archetype {
  preprocess() {
    ui.menu.set({
      anchor: screen.rect.lt.add(new Vec(0.05, -0.05 - 0.15 * ui.configuration.menu.scale)),
      pivot: { x: 0, y: 1 },
      size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
      rotation: 90,
      alpha: ui.configuration.menu.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: true,
    })
    ui.judgment.set({
      anchor: screen.rect.cl.add(new Vec(0.1, -0.05)),
      pivot: { x: 0, y: 1 },
      size: new Vec(0.15, 0.05).mul(ui.configuration.judgment.scale),
      rotation: 90,
      alpha: ui.configuration.judgment.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: false,

    })
  }

  spawnOrder() {
    return 0
  }

  updateSequential() {
    this.despawn = true
  }
}
