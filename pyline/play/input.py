from __future__ import annotations

from collections.abc import Iterator

from sonolus.script.array import Dim
from sonolus.script.containers import ArrayMap, VarArray
from sonolus.script.globals import level_memory
from sonolus.script.runtime import Touch, touches


@level_memory
class InputState:
    """"""

    """touch id → Note Entity Index (can't use Note EntityRef because circular import)"""
    claimed_touches_map: ArrayMap[int, int, Dim[16]]


def refresh_input_state():
    """Refresh the input data at the start of each frame.
    Called in `Stage` update sequential"""
    InputState.claimed_touches_map.clear()


def claim_touch(touch_id: int, entity_index: int) -> None:
    InputState.claimed_touches_map[touch_id] = entity_index


def is_touch_claimed(touch_id: int) -> bool:
    return touch_id in InputState.claimed_touches_map.keys()


def get_touch_owner_index(touch_id: int) -> int:
    return InputState.claimed_touches_map[touch_id]


def unclaimed_taps() -> Iterator[Touch]:
    for touch in touches():
        if touch.started and not is_touch_claimed(touch.id):
            yield touch


def claimed_taps() -> VarArray[Touch, Dim[16]]:
    taps = VarArray[Touch, 16].new()
    for touch in touches():
        if touch.started and is_touch_claimed(touch.id):
            taps.append(touch)
    return taps
