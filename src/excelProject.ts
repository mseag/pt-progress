// Copyright 2020 SIL International
// Utilities to process Excel spreadsheet and write status to JSON file
import * as fs from 'fs';
import * as books from './books';
import * as reporting from './reporting';
import {ProjectStatusType, StatusMap, Status} from './status';
const excelToJson = require('convert-excel-to-json');

/**
 * Name of the worksheet that contains project status
 */
const PROGRESS_SHEET = 'Progress';

/**
 * This contains methods for extracting status information
 * from the "Progress" sheet in the P&P Excel spreadsheets.
 * Several of the row and column information are hard-coded
 */
export class ExcelProject {
  /**
   * Parse the Excel file and return the project reporting information
   * This reads specific cells in the "Progress" sheet
   * @param {string} excelFile Path to the Excel file
   * @returns {reporting.Reporting} Project reporting information
   */
  public getReportingInfo(excelFile: string) : reporting.Reporting {
    const result = excelToJson({
      sourceFile: excelFile,
      sheets: [{
        name: PROGRESS_SHEET
      }]
    });

    /**
     * Extra text to remove from the project title
     */
    const PROJECT_TITLE_EXTRA =  'Progress Table';

    let projectTitle: string = result.Progress[0].P;
    projectTitle = projectTitle.replace(PROJECT_TITLE_EXTRA, '').trim();
    if (!projectTitle) {
      console.error(`Project title is blank (defined in "Planning" Excel worksheet)`);
      process.exit(1);
    }
    const quarter: reporting.QuarterType = result.Progress[1].AA;
    const year: string = result.Progress[1].AB;
    return new reporting.Reporting(projectTitle, quarter, parseInt(year));
  }

  /**
   * Parse the Excel file and return the project status as an object.
   * This reads specific cells in the "Progress" sheet .
   * The status object only includes information for the quarter & year (per reporting info)
   * and the status object is also written out to a file with the name:
   *   "[project name]-[reporting quarter]-[year].json"
   * @param {string} excelFile Path to Excel file
   * @param reportingInfo Project reporting information
   * @returns {ProjectStatusType} Project status object
   */
  public exportStatus(excelFile: string, reportingInfo: reporting.Reporting) :
      ProjectStatusType {
    const result = excelToJson({
      sourceFile: excelFile,
      sheets: [{
        name: PROGRESS_SHEET,
        header: {
          // Number of rows that will be skipped and not processed
          rows: 22
        },
        columnToKey: {
          P: 'bookName',
          Q: 'verses',

          R: 'exegesisQuarter',
          S: 'exegesisYear',

          T: 'teamQuarter',
          U: 'teamYear',

          V: 'advisorQuarter',
          W: 'advisorYear',

          X: 'communityQuarter',
          Y: 'communityYear',

          Z: 'consultantQuarter',
          AA: 'consultantYear',

          AB: 'publishQuarter',
          AC: 'publishYear'
        }
      }]
    })

    /**
     * Book "name" which marks the end of rows to process
     */
    const END_OF_BOOK_NAMES = 'Other Goals and Milestones';

    const b = new books.Books();
    const resultObj: ProjectStatusType = {};
    // Iterate through the progress table and process entries that that contain status
    for(let i = 0; i<result.Progress.length; i++) {
      const bookName = result.Progress[i].bookName;
      if (bookName === END_OF_BOOK_NAMES) {
        break;
      } else if (!bookName) {
        // Skip entries without a book name
        continue;
      }

      const bookInfo: books.bookType = b.getBookByName(bookName);
      if (bookInfo === undefined) {
        continue;
      }
      const code: books.CodeType = bookInfo.code;
      result.Progress[i].startingChapter = 1;

      // Special handling for 'verses' field (we need to adjust the starting chapter based on the previous entries)
      if (result.Progress[i].verses) {
        // Calculate the number of chapters for the unit based on the number of verses
        const chaptersForUnit : number = this.calculateChaptersFromVerses(
          result.Progress[i].verses, bookInfo.verses, bookInfo.chapters);
        result.Progress[i].chaptersForUnit = chaptersForUnit;

        // If previous row was the same book, also update 'startingChapter'
        if (i>0 && result.Progress[i-1] && (bookName === result.Progress[i-1].bookName) &&
            result.Progress[i].startingChapter && result.Progress[i-1].chaptersForUnit) {
          result.Progress[i].startingChapter =
            result.Progress[i-1].startingChapter + result.Progress[i-1].chaptersForUnit;
        }
      }

      // Process each book for phase statuses.
      // Because a project plan may split a book into several units of work,
      // the status for each entry gets appended into an array.
      const bookStatus: StatusMap[] = this.parseBookStatus(reportingInfo, result.Progress[i])
      if (bookStatus && bookStatus.length > 0) {
        if (!(code in resultObj)) {
          resultObj[code] = bookStatus;
        } else if (resultObj && code && resultObj[code]){
          // Append the book status
          let statusArray: StatusMap[] = resultObj[code] as StatusMap[];
          statusArray = statusArray.concat(bookStatus);
          resultObj[code] = statusArray;
        }
      }
    }

    // Write the status to a file.
    const filename = `${reportingInfo.projectName}-${reportingInfo.quarter}-${reportingInfo.year}.json`;
    if (fs.existsSync(filename)) {
      console.warn("Overwriting status file: " + filename);
    }
    fs.writeFileSync(filename, JSON.stringify(resultObj, null, 2));
    console.info("Project status written to " + filename);

    return resultObj;
  }

  /**
   * Calculate the number of completed chapters for the given unit of work.
   * If verses is defined, and/or phaseQuarter is a percentage (25%, 50%, 75%),
   * the completed chapters is a computed fraction of the total number of chapters.
   * Note: due to rounding, this likely means a book's final row won't sum
   * up to the total number of chapters
   * @param {reporting.Reporting} reportingInfo - reporting information
   * @param {books.bookType} bookInfo - book information
   * @param {number} startingChapter - The starting chapter for the unit of work
   * @param {reporting.QuarterType|number} phaseQuarter - quarter for the phase
            Sometimes the percentage string is formatted as a number.
   * @param {number} phaseYear - year for the phase
   * @param {number|undefined} verses - If defined, this factors into the calculation of
   *        completed chapters for the book
   * @returns {status.Status}
   */
  private completedChaptersInQuarter(
      reportingInfo: reporting.Reporting, bookInfo: books.bookType, startingChapter: number,
      phaseQuarter: reporting.QuarterType | number, phaseYear: number, verses: number|undefined): Status {
    let quarter: reporting.QuarterType;
    let chapters: number;
    const chaptersForUnit: number = (verses) ?
      this.calculateChaptersFromVerses(verses, bookInfo.verses, bookInfo.chapters) :
      bookInfo.chapters;

    switch(phaseQuarter) {
      // For percentages, use the reporting info quarter
      case '25%':
      case 0.25 :
        quarter = reportingInfo.quarter;
        chapters = Math.round(chaptersForUnit / 4);
        break;
      case '50%':
      case 0.50:
        quarter = reportingInfo.quarter;
        chapters = Math.round(chaptersForUnit / 2);
        break;
      case '75%':
      case 0.75:
        quarter = reportingInfo.quarter;
        chapters = Math.round(chaptersForUnit * 3 / 4);
        break;
      default:
        // Use the phase quarter
        quarter = phaseQuarter as reporting.QuarterType;
        chapters = chaptersForUnit;
    }

    const bookStatus = new Status(chapters, startingChapter, quarter, phaseYear);
    return bookStatus;
  }

  /**
   * Given a number of verses and chapters, apply the proportion to calculate a number of chapters
   * @param {number} verses          Number of completed verses for the unit
   * @param {number} totalVerses     Total number of verses for a book
   * @param {number} chaptersInBook  Total number of chapters for a book
   * @returns {number} The calculated proportion of completed chapters (rounded)
   */
  private calculateChaptersFromVerses(verses: number, totalVerses: number,
      chaptersInBook: number) : number {
    if (totalVerses === undefined || totalVerses == 0) {
      return chaptersInBook;
    }
    return Math.round(chaptersInBook * verses / totalVerses);
  }

  /**
   * Parse a row from the Excel "Progress" sheet. For each phase containing
   * status information (quarter, year), a status object {status.Status} is created.
   * @param {reporting.Reporting} reportingInfo Project information
   * @param {Object} bookEntry Cells from the row denoting status for each phase
   * @returns StatusMap[] array status consisting of phase, quarter, year, and completed chapters
   */
  private parseBookStatus(reportingInfo: reporting.Reporting, bookEntry: any) : StatusMap[] {
    const bookName = bookEntry.bookName;
    const b = new books.Books;
    const bookInfo = b.getBookByName(bookName);

    const statusArray : StatusMap[] = [];
    const startingChapter: number = bookEntry.startingChapter;
    // Can't for loop since columns have unique names
    if (bookEntry.exegesisQuarter) {
      if (bookEntry.exegesisYear) {
        statusArray.push(
          {"exegesis" : this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.exegesisQuarter as reporting.QuarterType, bookEntry.exegesisYear, bookEntry.verses)
          });
      } else {
        console.warn("Warning: " + bookName + " (Exegesis) year empty");
      }
    }
    if (bookEntry.teamQuarter) {
      if (bookEntry.teamYear) {
        statusArray.push(
          {"team": this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.teamQuarter, bookEntry.teamYear, bookEntry.verses)
          });
        } else {
          console.warn("Warning: " + bookName + " (Team Check) year empty");
        }
    }
    if (bookEntry.advisorQuarter) {
      if (bookEntry.advisorYear) {
        statusArray.push(
          {"advisor" : this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.advisorQuarter, bookEntry.advisorYear, bookEntry.verses)
          });
      } else {
        console.warn("Warning: " + bookName + " (Advisor Check) year empty");
      }
    }
    if (bookEntry.communityQuarter) {
      if (bookEntry.communityYear) {
        statusArray.push(
          {"community" : this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.communityQuarter, bookEntry.communityYear, bookEntry.verses)
          });
      } else {
        console.warn("Warning: " + bookName + " (Community Testing) year empty");
      }
    }
    if (bookEntry.consultantQuarter) {
      if (bookEntry.consultantYear) {
        statusArray.push(
          {"consultant" : this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.consultantQuarter, bookEntry.consultantYear, bookEntry.verses)
          });
      } else {
        console.warn("Warning: " + bookName + " (Consultant Checked) year empty");

      }
    }
    if (bookEntry.publishQuarter) {
      if (bookEntry.publishYear) {
        statusArray.push(
          {"publish" : this.completedChaptersInQuarter(
            reportingInfo, bookInfo, startingChapter,
            bookEntry.publishQuarter, bookEntry.publishYear, bookEntry.verses)
          });
      } else {
        console.warn("Warning: " + bookName + " (Published) year empty");
      }
    }

    return statusArray;
  }
}
