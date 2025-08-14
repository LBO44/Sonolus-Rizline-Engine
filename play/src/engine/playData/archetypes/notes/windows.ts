export const judgeWindows = {
  tapNote: {
    //also hold start
    perfect: Range.one.mul(0.045), //perfect
    great: Range.one.mul(0.09), // Early/Late
    good: Range.one.mul(0.095), //bad
  },
  holdEnd: {
    //can be early but can't be Late as you don't need to release
    perfect: new Range({ min: -0.045, max: 0 }),
    great: new Range({ min: -0.09, max: 0 }),
    good: new Range({ min: -0.09, max: 0 }), //Hold End can't be bad
  },
  dragNote: {
    //can only be perfect or miss
    perfect: Range.one.mul(0.045),
    great: Range.one.mul(0.045),
    good: Range.one.mul(0.045),
  },
}

export const bucketWindows = {
  tapNote: {
    perfect: Range.one.mul(45), //perfect
    great: Range.one.mul(90), // Early/Late
    good: Range.one.mul(95), //bad
  },
  holdEnd: {
    perfect: new Range({ min: -45, max: 0 }),
    great: new Range({ min: -90, max: 0 }),
    good: new Range({ min: -90, max: 0 }),
  },
  dragNote: {
    perfect: Range.one.mul(45),
    great: Range.one.mul(45),
    good: Range.one.mul(45),
  },
}
