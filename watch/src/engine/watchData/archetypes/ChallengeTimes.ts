abstract class ChallengeTime extends Archetype {

  import = this.defineImport({
    Beat: { name: "Beat", type: Number }
  })

}

export class ChallengeStart extends ChallengeTime {
}

export class ChallengeEnd extends ChallengeTime {
}
