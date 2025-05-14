export const judgeWindows = {
  tapNote: {
    perfect: Range.one.mul(0.045), //perfect
    great: Range.one.mul(0.090), // Early/Late
    good: Range.one.mul(0.095), //bad
  },
  holdEnd: {
    perfect: Range.one.mul(0.045),
    great: Range.one.mul(0.090),
    good: Range.one.mul(0.090),
  },
  dragNote: {
    perfect: Range.one.mul(0.045),
    great: Range.one.mul(0.045),
    good: Range.one.mul(0.045),
  }
}
export const bucketWindows = {
  tapNote: {
    perfect: Range.one.mul(45), //perfect
    great: Range.one.mul(90), // Early/Late
    good: Range.one.mul(95), //bad
  },
  holdEnd: {
    perfect: Range.one.mul(45),
    great: Range.one.mul(90),
    good: Range.one.mul(90),
  },
  dragNote: {
    perfect: Range.one.mul(45),
    great: Range.one.mul(45),
    good: Range.one.mul(45),
  }
}

