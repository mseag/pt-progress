// Copyright 2020 SIL International
// Types and methods for handling P&P Excel spreadsheet

/**
 * Valid strings for the reporting quarter.
 * Per "Progress" sheet in the P&P spreadsheet:
 * Oct-Dec  = Q1
 * Jan-Mar  = Q2
 * Apr-Jun  = Q3
 * Jul-Sept = Q4
 *
 * When handling status, "25", "50%", "75%" reflect the completion percentage
 * of chapters for a book's "unit of work"
 * (Some project plans may split a book into several rows).
 */
export type QuarterType = "Q1" | "Q2" | "Q3" | "Q4" | "25%" | "50%" | "75%";

/**
 * Validate a quarter is of [Q1, Q2, Q3, Q4] and not a percentage
 * @param {QuarterType} quarter
 * @returns {boolean}
 */
export function isQuarter(quarter: QuarterType): boolean {
  switch (quarter) {
    case 'Q1':
    case 'Q2':
    case 'Q3':
    case 'Q4':
      return true;
    default:
      return false;
  }
}

/**
 * Reporting information for a project, as defined in the P&P Excel spreadsheet.
 */
export class Reporting {
  projectName: string;
  month: string;        // month number as a string
  quarter: QuarterType; // reporting quarter
  year: string;         // 4-digit year

  constructor(projectName: string, quarter: QuarterType, year: string) {
    this.projectName = projectName;
    this.month = this.QuarterToMonth(quarter);
    this.quarter = quarter;
    this.year = year;
  }

  /**
   * Conversion from reporting quarter to month number.
   */
  private QuarterToMonth(quarter: QuarterType): string {
    switch (quarter) {
      case 'Q1': return '12';
      case 'Q2': return '03';
      case 'Q3': return '06';
      case 'Q4': return '09';
      default:
        console.warn('Attempting to get month number from quarter ' + quarter);
        return '00'; // Percentages don't have a month number
    }
  }
}

/**
 * Conversion from ISO 8601 timestamp to reporting fiscal quarter.
 * Oct-Dec  = `Q1`
 * Jan-Mar  = `Q2`
 * Apr-Jun  = `Q3`
 * Jul-Sept = `Q4`
 * @param {string} dateString - ISO 8601 timestamp
 * @returns {QuarterType}
 */
export function getReportingQuarter(dateString: string): QuarterType {
  const date: Date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const month: number = date.getMonth();
    if (month >= 10) {
      return 'Q1';
    } else if (month >= 7) {
      return 'Q4';
    } else if (month >= 4) {
      return 'Q3';
    }
  } else {
    console.error("Invalid date: " + dateString);
    process.exit(1);
  }

  return 'Q2';
}

/**
 * Conversion from ISO 8601 timestamp to reporting fiscal year.
 * Note: Oct-Dec counts as `Q1` of the previous year.
 * @param {string} dateString - ISO 8601 timestamp
 * @returns {number} - 4 digit reporting year as a number
 */
export function getReportingYear(dateString: string): number {
  const date: Date = new Date(dateString);
  let year = 0;
  if (!isNaN(date.getTime())) {
    // Oct-Dec counts as Q1 of the previous year
    year = (date.getMonth() >= 10) ? date.getFullYear() - 1 : date.getFullYear();
  } else {
    console.error("Invalid date: " + dateString);
    process.exit(1);
  }
  return year;
}

/**
 * Return an ISO 8601 local timestamp.
 * Instead of getting current date with moment().format(), generate the reporting
 * which will be the 28th of the final month in the reporting quarter
 * Also assigning an arbitrary time
 * @param {Reporting} reporting - Project information
 * @returns {string} ISO 8601 date
 */
export function getReportingDate(reporting: Reporting): string {
  const REPORTING_TIME = "09:19:56.0972475+07:00"

  if (reporting.year && reporting.month) {
    const reportingDate = `${reporting.year}-${reporting.month}-28T${REPORTING_TIME}`;
    return reportingDate;
  }

  console.error("Unable to generate reporting date because reporting year or quarter undefined");
  process.exit(1);
}

export default Reporting;
