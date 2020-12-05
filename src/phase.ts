// Copyright 2020 SIL International
// Types and utilities for project phases

export type PhaseType =
  // exegesis and first draft
  "exegesis" |
  // team checking
  "team" |
  // advisor check and back translation
  "advisor" |
  // community testing
  "community" |
  // consultant checking
  "consultant" |
  // publish
  "publish";

export class Phase {
  /**
   * Convert phase to Paratext stage index. Stage index is used to access the
   * <Stages> node in "ProjectProgress.xml"
   * @param {PhaseType} ppPhase
   * @returns {number} Corresponding Paratext stage index
   */
  // Function to convert PP phase to Paratext phase
  public phaseToStageIndex(ppPhase : PhaseType) : number {
    switch(ppPhase) {
      case 'exegesis': return 0;
      case 'team': return 1;
      case 'advisor': return 2;
      case 'community': return 3;
      case 'consultant': return 4;
      case 'publish': return 5;
      default:
        console.error('Invalid phase: ' + ppPhase);
        return -1;
    }
  }

  /**
   * Convert Paratext stage index to phase.
   * @param {number} Stage index from [0, 5]
   * @returns {PhaseType}
   */
  public stageIndexToPhase(index: number): PhaseType {
    switch(index) {
      case 0: return 'exegesis';
      case 1: return 'team';
      case 2: return 'advisor';
      case 3: return 'community';
      case 4: return 'consultant';
      case 5: return 'publish';
      default:
        console.error('Invalid stage index: ' + index + ', should be from [0, 5]');
        process.exit(1);
    }
  }
}
