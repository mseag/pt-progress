export class Reporting {
  projectName: string;
  month: string;
  year: string;

  constructor(projectName: string, quarter: string, year: string) {
    this.projectName = projectName;
    this.month = this.QuarterToMonth.get(quarter) as string;
    this.year = year;
  }

  // Conversion from reporting quarter to month
  private QuarterToMonth = new Map([
    ['Q1', '12'],
    ['Q2', '03'],
    ['Q3', '06'],
    ['Q4', '09']
  ])
}

/**
 * Function getReportingDate
 * Description: Instead of getting current date with moment().format(), 
 * generate the reporting date which will be the 28th of the final month in the reporting quarter
 * Also assigning an arbitrary time
 */
export function getReportingDate(reporting: Reporting): string {
  const reportingTime = "09:19:56.0972475+07:00"

  if (reporting.year && reporting.month) {
    let reportingDate = reporting.year + "-" + reporting.month + "-28T" + reportingTime
    return reportingDate
  }

  console.error("Unable to generate reporting date because reporting year or quarter undefined")
  process.exit(1)
}



export default Reporting;
