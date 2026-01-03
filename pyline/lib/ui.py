from sonolus.script.runtime import HorizontalAlign, runtime_ui, screen
from sonolus.script.ui import UiConfig, UiJudgmentErrorPlacement, UiMetric
from sonolus.script.vec import Vec2

ui_config = UiConfig(
    primary_metric=UiMetric.LIFE,
    secondary_metric=UiMetric.ACCURACY_PERCENTAGE,
    judgment_error_placement=UiJudgmentErrorPlacement.BOTTOM,
)


def init_ui():
    ui = runtime_ui()
    ui.menu.update(
        anchor=screen().tl + Vec2(0.085, -0.075 - 0.15 * ui.menu_config.scale),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.15, 0.15) * ui.menu_config.scale,
        rotation=90,
        alpha=ui.menu_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.primary_metric_bar.update(
        anchor=screen().bl + Vec2(0.085, 0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(
            screen().h - (0.2 + 0.15 * ui.menu_config.scale),
            0.15 * ui.primary_metric_config.scale,
        ),
        rotation=90,
        alpha=ui.primary_metric_config.scale,
        horizontal_align=HorizontalAlign.LEFT,
        background=True,
    )
    ui.primary_metric_value.update(
        anchor=screen().bl
        + Vec2(
            0.085 + (0.15 / 4) * ui.primary_metric_config.scale,
            0.075 + 0.2 * ui.primary_metric_config.scale,
        ),
        pivot=Vec2(0, 1),
        dimensions=Vec2(
            screen().h - (0.2 + 0.05 * ui.menu_config.scale),
            0.075 * ui.primary_metric_config.scale,
        ),
        rotation=90,
        alpha=ui.primary_metric_config.scale,
        horizontal_align=HorizontalAlign.LEFT,
        background=False,
    )
    ui.judgment.update(
        anchor=screen().ml + Vec2(0.3, 0),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0, 0.1) * ui.judgment_config.scale,
        rotation=90,
        alpha=ui.judgment_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=False,
    )
    ui.combo_value.update(
        anchor=screen().tl + Vec2(0.31, -0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0, 0.1) * ui.judgment_config.scale,
        rotation=90,
        alpha=ui.combo_config.alpha,
        horizontal_align=HorizontalAlign.RIGHT,
        background=False,
    )
    ui.progress.update(
        anchor=screen().br + Vec2(-0.075 - 0.15 * ui.progress_config.scale, 0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(screen().h - 0.15 * ui.progress_config.scale, 0.15),
        rotation=90,
        alpha=ui.progress_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.instruction.update(
        anchor=(screen().ml) + Vec2(0.3, -0.3),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.6, 0.1) * ui.instruction_config.scale,
        rotation=90,
        alpha=ui.instruction_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.previous.update(
        anchor=screen().mb + Vec2(0, 0.1),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.1, 0.1) * ui.navigation_config.scale,
        rotation=90,
        alpha=ui.navigation_config.alpha,
        horizontal_align=HorizontalAlign.LEFT,
        background=True,
    )
    ui.next.update(
        anchor=screen().mt + Vec2(0, -0.2),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.1, 0.1) * ui.navigation_config.scale,
        rotation=90,
        alpha=ui.navigation_config.alpha,
        horizontal_align=HorizontalAlign.RIGHT,
        background=True,
    )
