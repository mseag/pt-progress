import * as phase from "./phase";

interface projectStatusType {
  bookChapter: string;
  done: string; // boolean
  user: string;
  date: string;
}

export class Progress {

  /*
  private interface Chapter {
    chapter: number
  }
  interface Phase {
    phase: Chapter
  }
  interface statusType {
    bookCode: Phase
  }
  */


  /**
   * Function getBookChapterNumber
   * @param {object} JSON object of book information
   * @param {string} bookCode 3-character book code
   * @param {number} chapter  Chapter number (0 used for "published" status)
   * Description: Given a 3-character book code and chapter number, create a #-# string
   * corresponding to [Paratext book code number]-[chapter number]
   * If the book is not found, returns -1
   * Note: Paratext seems to use book number 40 for Matthew in the "Assignments and Progress" tables 
   * (vs skipping book 40)
   */
  public getBookChapterNumber(booksObj: any, bookCode: string, chapter: number): string {
    if (bookCode in booksObj) {
      return booksObj[bookCode].BookNum + "-" + chapter;
    }

    // Otherwise, invalid book code
    console.warn("Book code " + bookCode + " no found")
    return "-1";
  }

  /**
   * Function updateProgress
   * @param {object} booksObj      JSON object of book information
   * @param {object} progressObj   JSON object from the project reports which contains completed info
   * @param {object} xmlObj        JSON object of ProgressProgress.xml which is modified
   * @param {string} user          Paratext user for each updated status element
   * @param {string} reportingDate string of the reporting date
   * Description  Update the assignment and status sections of xmlObj for each Paratext phase.
   * xmlObj is modified during the process.
   */
  public updateProgress(booksObj: any, progressObj: any, xmlObj: any , user: string, reportingDate: string): void {
    // Mapping from the "Progress and Planning" phases to the Paratext phases
    // typos match the spellings in Paratext
    /*const PPToParatextPhase: Map<string, string> = new Map
      ([['Exegesis & First Draft', 'Exegisis & First Draft'],
        ['Team Check', 'Team Checking'],
        ['Advisor check and back transaltion', 'Advisor check and back transaltion'],
        ['community testing', 'Community Testing'],
        ['Con-sultant Check', 'Consultant Check'],
        ['Pub-lished', 'Published']]);
    */

    // Fill out progress for the project phase
    // Not using forEach to maintain context
    let p = new phase.Phase();
    for (let bookCode in progressObj) {
      let bookObj = progressObj[bookCode];
      for (let ppPhase in bookObj) {
        let paratextPhase: string = p.phaseToParatextPhase(ppPhase) as string;

        let stageIndex: number = p.ParatextPhaseToStageIndex.get(paratextPhase) as number;
        
        // Investigate if the XPath xmlObj.ProgressInfo.Stages.Stage[stageIndex].Task
        // is valid across the Paratext projects

        // Keep a reference to Task so xmlObj will be modified
        let task = xmlObj.ProgressInfo.Stages.Stage[stageIndex].Task;
        if (Array.isArray(task)) {
          task = xmlObj.ProgressInfo.Stages.Stage[stageIndex].Task[0];
        }
        // Update Assignments node.
        let assignmentsArray = task.Assignments
        if (assignmentsArray === undefined) {
          console.warn("Error updating assignments for " + bookCode + " in phase " + paratextPhase + ". Skipping...")
          continue;
        }
        // Convert from JSON to JSONArray as needed so we can push new assignments
        if (!Array.isArray(assignmentsArray)) {
          task.Assignments = [task.Assignments]
          assignmentsArray = task.Assignments;
        }
        let existingIndex = assignmentsArray.findIndex((el: any) => el.book === bookCode);
        if (existingIndex == -1) {
          // Add new assignment
          let updatedAssignment: any = {};
          updatedAssignment.book = bookCode;
          assignmentsArray.push(updatedAssignment)
        }

        // Update Status node.
        let statusArray: projectStatusType[] = task.Status
        if (statusArray === undefined) {
          console.warn("Error updating status for " + bookCode + " in phase " + paratextPhase + ". Skipping...")
          continue;
        }
        // Convert from JSON to JSONArray as needed so we can push new status
        if (!Array.isArray(statusArray)) {
          task.Status = [task.Status]
          statusArray = task.Status;
        }

        for (let ch=1; ch<=bookObj[ppPhase]; ch++) {
          let bookChapterNumber: string;
          if (paratextPhase == "Published") {
            // Publishing only deals with Chapter "0":
            // Could optimize this to not happen for each chapter
            bookChapterNumber = this.getBookChapterNumber(booksObj, bookCode, 0);
          } else {
            bookChapterNumber = this.getBookChapterNumber(booksObj, bookCode, ch);
          } 

          let updatedStatus: projectStatusType;
          let existingIndex: number = statusArray.findIndex(el => el.bookChapter === bookChapterNumber);
          if (existingIndex != -1) {
            // Update existing status to "Done"
            if (statusArray[existingIndex].done != "true") {
              statusArray[existingIndex].done = "true";
              statusArray[existingIndex].user = user;
              statusArray[existingIndex].date = reportingDate
            }
          } else {
            // Create new status
            updatedStatus = {
              bookChapter: bookChapterNumber,
              done: "true",
              user: user,
              date: reportingDate};

            statusArray.push(updatedStatus);
          }
        }
      }
    }
  }

}