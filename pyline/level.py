from sonolus.script.level import Level, LevelData


level = Level(
    name="pyline_level",
    title="rizline.py Level",
    bgm=None,
    data=LevelData(
        bgm_offset=0,
        entities=[
        ],
    ),
)

def load_levels():
    yield level
