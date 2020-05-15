class Reporting {
  constructor(projectName, quarter, year) {
    this.projectName = projectName;
    this.quarter = quarter;
    this.year = year;
  }

 // Method

  /**
   * Function getReportingDate
   * Description: Instead of getting current date with moment().format(), 
   * generate the reporting date which will be the 28th of the final month in the reporting quarter
   * Also assigning an arbitrary time
   */
  getReportingDate() {
    // Mapping from Fiscal quarter to reporting month (2 digit string)
    const ReportingQuarterToMonth = new Map
      ([['Q1', '12'],
        ['Q2', '03'],
        ['Q3', '06'],
        ['Q4', '09']])

    const reportingTime = "09:19:56.0972475+07:00"

    if (!ReportingQuarterToMonth.has(this.quarter)) {
      console.error("Unable to generate reporting date for invalid reporting quarter: " + this.quarter)
      process.exit(1)
    }
    let reportingDate = this.year + "-" + ReportingQuarterToMonth.get(this.quarter) + "-28T" + reportingTime
    return reportingDate
  }
}

export default Reporting;
