import { archetypes } from "../../.."
import { SingleNote } from "../SingleNote"

export abstract class TappabaNote extends SingleNote {
  tappableNoteImport = this.defineImport({
    IsDoubleNote: { name: "IsDoubleNote", type: Boolean },
    PartnerNote: { name: "PartnerNote", type: Number },
  })

  tappableSharedMemory = this.defineSharedMemory({
    posY: Number,
    wasHit: Boolean, //used for double note + hold end for hold start
  })

  //The issue is that 1st note Touch will be execute before 2nd note Touch,
  //So if 2 fingers are on the 2nd note's side, the 2nd will be hit but by the time it tells the first it has been hit, the 1st has already run its Touch where it considers it not hit.
  //But if the 2 fingers are on the 1st note's side, the 1st note will be hit but will mark the 1st finger as used
  //So the 2nd note will only see 1 finger, and because despawn entity state isn't updated immediately, 2nd will think 1st note hasn't been hit. This is why we also need the shared memory wasHit.

  skippedTouchForPartner = this.entityMemory(Boolean)

  shouldSkipTouchForSidePriority(touch: Touch) {
    if (!this.tappableNoteImport.IsDoubleNote || entityInfos.get(this.tappableNoteImport.PartnerNote).state != EntityState.Active) return false

    if (this.skippedTouchForPartner) return false

    let doubleNoteY = 0

    const partnerNote = this.tappableNoteImport.PartnerNote

    switch (entityInfos.get(partnerNote).archetype) {
      case archetypes.NormalTapNote.index:
        if (archetypes.NormalTapNote.tappableSharedMemory.get(partnerNote).wasHit) return false
        doubleNoteY = archetypes.NormalTapNote.tappableSharedMemory.get(partnerNote).posY
        break
      case archetypes.NormalHoldNote.index:
        if (archetypes.NormalHoldNote.tappableSharedMemory.get(partnerNote).wasHit) return false
        doubleNoteY = archetypes.NormalHoldNote.tappableSharedMemory.get(partnerNote).posY
        break

      case archetypes.ChallengeTapNote.index:
        if (archetypes.ChallengeTapNote.tappableSharedMemory.get(partnerNote).wasHit) return false
        doubleNoteY = archetypes.ChallengeTapNote.tappableSharedMemory.get(partnerNote).posY
        break
      case archetypes.ChallengeHoldNote.index:
        if (archetypes.ChallengeHoldNote.tappableSharedMemory.get(partnerNote).wasHit) return false
        doubleNoteY = archetypes.ChallengeHoldNote.tappableSharedMemory.get(partnerNote).posY
        break
    }

    const middleY = (this.pos.y + doubleNoteY) / 2

    if (this.pos.y < doubleNoteY) {
      if (touch.y > middleY) {
        this.skippedTouchForPartner = true
        return true
      }
    } else if (this.pos.y > doubleNoteY) {
      if (touch.y < middleY) {
        this.skippedTouchForPartner = true
        return true
      }
    }
    return false
  }
}
