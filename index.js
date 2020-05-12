'use strict';

const fs = require("fs");
const moment = require("moment");
const xmlParser = require("xml2json");
const vkbeautify = require("vkbeautify");

// Mapping from the "Progress and Planning" phases to the Paratext phases
const PPToParatextPhase = new Map
  ([['Exegesis & First Draft', 'Exegisis & First Draft'],
    ['Team Check', 'Team Checking'],
    ['Advisor check and back transaltion', 'Advisor check and back transaltion'],
    ['community testing', 'Community Testing'],
    ['Con-sultant Check', 'Consultant Check'],
    ['Pub-lished', 'Published']]);

// Mapping from Fiscal quarter to reporting month (2 digit string)
const ReportingQuarterToMonth = new Map
  ([['Q1', '12'],
    ['Q2', '03'],
    ['Q3', '06'],
    ['Q4', '09']])

    // Given a book name and chapter number, create a #-# string
// corresponding to [Paratext book number]-[chapter number]
// bookName - 3 character short name
// chapter  - Integer for the chapter
function getBookChapterNumber(shortName, chapter) {
  if (shortName in booksObj) {
    return booksObj[shortName].BookNum + "-" + chapter;
  }

  // Otherwise, invalid book Name
  return "-1";
}

// Update the drafting progress sections of xmlObj.
// progressObj: object from the project reports which contains completed info
// xmlObj: ProjectProgress.xml as an object to update
// user: String of the user for each updated status element
function updateDraftingProgress(progressObj, xmlObj, user) {
  
  // Instead of getting current date with moment().format(), 
  // replace the current date with the end of the reporting quarter (assume 28th of the final month in quarter)
  // And also assigning arbitratry time
  let reportingTime = "09:19:56.0972475+07:00"
  let reportingDate = reportingYear + "-" + ReportingQuarterToMonth.get(reportingQuarter) + "-28T" + reportingTime

  // Fill out drafting progress
  // Not using forEach to maintain context
  for (let shortName in progressObj) {
    let bookObj = progressObj[shortName];
    for (let ppPhase in bookObj) {
      let paratextPhase = PPToParatextPhase.get(ppPhase);

      let statusArray;
      if (paratextPhase == "Exegisis & First Draft") {

        // Update Assignments node
        let assignmentsArray = xmlObj.ProgressInfo.Stages.Stage[0].Task.Assignments;
        let existingIndex = assignmentsArray.findIndex(el => el.book === shortName);
        if (existingIndex == -1) {
          // Add new assignment
          let updatedAssignment = {};
          updatedAssignment.book = shortName;
          assignmentsArray.push(updatedAssignment)
        }

        statusArray = xmlObj.ProgressInfo.Stages.Stage[0].Task.Status;
        //console.log(statusArray)
        for (let ch=1; ch<=bookObj[ppPhase]; ch++) {
          let bookChapterNumber = getBookChapterNumber(shortName, ch);
          let updatedStatus = {};
          //let existingStatus = statusArray.find(el => el.bookChapter === bookChapterNumber);
          let existingIndex = statusArray.findIndex(el => el.bookChapter === bookChapterNumber);

          if (existingIndex != -1) {
            // Update existing status
            if (statusArray[existingIndex].done != "true") {
              statusArray[existingIndex].done = true;
              statusArray[existingIndex].user = user;
              statusArray[existingIndex].date = reportingDate
            }
          } else {
            // Create new status
            updatedStatus.bookChapter = bookChapterNumber;
            updatedStatus.done = "true";
            updatedStatus.user = user;
            updatedStatus.date = reportingDate
            //console.log(updatedStatus);

            statusArray.push(updatedStatus);
          }
        }
      }
    }
  }
}


// Start
// Usage:
// node index.js [progress JSON file]
//

let statusFilename;
if (process.argv.length > 2) {
  statusFilename = process.argv[2];
} else {
  // Default test files
  statusFilename = "MEP-Q2-2020.json"
}

console.log("Processing status file: " + statusFilename);
if (!fs.existsSync(statusFilename)) {
  console.error("Can't open status file " + statusFilename)
  process.exit(1)
}

// Determine the reporting quarter and year from the filename
let statusFilenameArr = statusFilename.split(/[-.]+/)
if (statusFilenameArr.length < 4) {
  console.error("Unable to determine reporting quarter / year from " + statusfilename)
  process.exit(1)
}
let reportingQuarter = statusFilenameArr[1];
let reportingYear = statusFilenameArr[2];

let progressData, progressObj;
progressData = fs.readFileSync(statusFilename);
progressObj = JSON.parse(progressData)
//console.log(progressObj)

// Mapping of book names to book number (according to Paratext) and chapter numbers
let booksData = fs.readFileSync("./books.json");
let booksObj = JSON.parse(booksData);

// TODO: Project XML path as parameter
var data = fs.readFileSync("./ProjectProgress.xml",'utf-8');
const xmlObj = xmlParser.toJson(data, {reversible: true, object: true})
//console.log(xmlObj)

// TODO: Define user as parameter
let user = "Darcy Wong";
updateDraftingProgress(progressObj, xmlObj, user);

// Convert back to XML and beautify
let options = {
  sanitize: true,
  ignoreNull: false
};
let updatedData = xmlParser.toXml(xmlObj, options);
updatedData = vkbeautify.xml(updatedData, 2);

// xmlParser loses the XML tags so append when writing back to file
let header = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
fs.writeFileSync("./ProjectProgress.xml", header + updatedData);
console.log();