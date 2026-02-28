from pyline.lib.ease import camera
from pyline.lib.layout import X_NOTE_DISAPPEAR, X_SPAWN
from pyline.lib.ui import init_ui


def preprocess():
    init_ui()
    camera.scale = 1
    camera.scaled_x_note_disappear = X_NOTE_DISAPPEAR
    camera.scaled_x_spawn = X_SPAWN
