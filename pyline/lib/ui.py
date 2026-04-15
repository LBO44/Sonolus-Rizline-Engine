from sonolus.script.runtime import (
    HorizontalAlign,
    is_preview,
    is_tutorial,
    runtime_ui,
    safe_area,
)
from sonolus.script.ui import UiConfig, UiJudgmentErrorPlacement, UiMetric
from sonolus.script.vec import Vec2

from pyline.lib.options import Options

ui_config = UiConfig(
    primary_metric=UiMetric.LIFE,
    secondary_metric=UiMetric.ACCURACY_PERCENTAGE,
    judgment_error_placement=UiJudgmentErrorPlacement.BOTTOM,
    judgment_error_min=50,
)


def init_ui():
    ui = runtime_ui()
    ui_area = safe_area()
    ui.menu.update(
        anchor=ui_area.tl + Vec2(0.085, -0.075 - 0.15 * ui.menu_config.scale),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.15, 0.15) * ui.menu_config.scale,
        rotation=90,
        alpha=ui.menu_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=is_tutorial() or is_preview() or (not Options.colored_ui),
    )
    ui.primary_metric_bar.update(
        anchor=ui_area.bl + Vec2(0.085, 0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(
            ui_area.h - (0.2 + 0.15 * ui.menu_config.scale),
            0.15 * ui.primary_metric_config.scale,
        ),
        rotation=90,
        alpha=ui.primary_metric_config.scale,
        horizontal_align=HorizontalAlign.LEFT,
        background=not Options.colored_ui,
    )
    ui.primary_metric_value.update(
        anchor=ui_area.bl
        + Vec2(
            0.085 + (0.15 / 4) * ui.primary_metric_config.scale,
            0.075 + 0.2 * ui.primary_metric_config.scale,
        ),
        pivot=Vec2(0, 1),
        dimensions=Vec2(
            ui_area.h - (0.2 + 0.05 * ui.menu_config.scale),
            0.075 * ui.primary_metric_config.scale,
        ),
        rotation=90,
        alpha=ui.primary_metric_config.scale,
        horizontal_align=HorizontalAlign.LEFT,
        background=False,
    )
    ui.judgment.update(
        anchor=ui_area.ml + Vec2(0.3, 0),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0, 0.1) * ui.judgment_config.scale,
        rotation=90,
        alpha=ui.judgment_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=False,
    )
    ui.combo_value.update(
        anchor=ui_area.tl + Vec2(0.31, -0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0, 0.1) * ui.judgment_config.scale,
        rotation=90,
        alpha=ui.combo_config.alpha,
        horizontal_align=HorizontalAlign.RIGHT,
        background=False,
    )
    ui.progress.update(
        anchor=ui_area.br + Vec2(-0.075 - 0.15 * ui.progress_config.scale, 0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(ui_area.h - 0.15 * ui.progress_config.scale, 0.15),
        rotation=90,
        alpha=ui.progress_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.progress_graph.update(
        anchor=ui_area.br + Vec2(-0.25 - 0.3 * ui.progress_config.scale, 0.075),
        pivot=Vec2(0, 1),
        dimensions=Vec2(ui_area.h - 0.15 * ui.progress_config.scale, 0.3),
        rotation=90,
        alpha=ui.progress_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.instruction.update(
        anchor=ui_area.ml + Vec2(0.3, -0.3),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.6, 0.1) * ui.instruction_config.scale,
        rotation=90,
        alpha=ui.instruction_config.alpha,
        horizontal_align=HorizontalAlign.CENTER,
        background=True,
    )
    ui.previous.update(
        anchor=ui_area.mb + Vec2(0, 0.1),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.1, 0.1) * ui.navigation_config.scale,
        rotation=90,
        alpha=ui.navigation_config.alpha,
        horizontal_align=HorizontalAlign.LEFT,
        background=True,
    )
    ui.next.update(
        anchor=ui_area.mt + Vec2(0, -0.2),
        pivot=Vec2(0, 1),
        dimensions=Vec2(0.1, 0.1) * ui.navigation_config.scale,
        rotation=90,
        alpha=ui.navigation_config.alpha,
        horizontal_align=HorizontalAlign.RIGHT,
        background=True,
    )
