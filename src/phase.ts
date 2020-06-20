// Basic phases that match the output of the P&P spreadsheet macro
export const enum PhaseType {
  exegesisAndFirstDraft = "exegesisAndFirstDraft",
  teamChecking = "teamChecking",
  advisorCheckAndBackTranslation = "advisorCheckAndBackTranslation",
  communityTesting = "communityTesting",
  consultantChecking = "consultantChecking",
  publish = "publish"
} 

export class Phase {

  public ParatextPhaseToStageIndex = new Map([
    ['Exegisis & First Draft', 0],
    ['Team Checking', 1],
    ['Advisor check and back transaltion', 2],
    ['Community Testing', 3],
    ['Consultant Check', 4],
    ['Published', 5]
  ]);

  // Map to Paratext phases
  private phaseToParatext = new Map([
    [PhaseType.exegesisAndFirstDraft, 'Exegisis & First Draft'],
    [PhaseType.teamChecking, 'Team Checking'],
    [PhaseType.advisorCheckAndBackTranslation, 'Advisor check and back transaltion'],
    [PhaseType.communityTesting, 'Community Testing'],
    [PhaseType.consultantChecking, 'Consultant Check'],
    [PhaseType.publish, 'Published']
  ]);

  // Function to convert PP phase to Paratext phase
  public phaseToParatextPhase(ppPhase : string) : string {
    let phase: PhaseType = ppPhase as PhaseType;
    return this.phaseToParatext.get(phase) as string;
  }  
}