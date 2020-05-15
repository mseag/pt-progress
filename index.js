// Copyright 2020 SIL International
'use strict';

import fs from 'fs';
import path from 'path';
import Reporting from './reporting.js';
import xmlParser from 'xml2json';
import vkbeautify from 'vkbeautify';

/**
 * Function displayUsage
 * Description: Displays help info
 */
function displayUsage() {
  console.info("node index.js [user name] [status file] [Paratext project path]")
  console.info("[user name] - Paratext user name that will be") 
  console.info("    updating the Paratext project status")
  console.info("\n")
  console.info("[status file] - JSON file created from the P&P Excel spreadsheet.")
  console.info("    The filename should consist of")
  console.info("    [project name]-[reporting quarter]-[reporting year] (e.g. MEP-Q2-2020.json)")
  console.info("    This file contains info of book code, translation phase, and")
  console.info("    number of chapters completed in the reporting quarter")
  console.info("\n")
  console.info("[Paratext project path] - path to the Paratext project")
  process.exit(1)
}


/**
 * Function getBookChapterNumber
 * @param {string} bookCode 3-character book code
 * @param {integer} chapter  Chapter number (0 used for "published" status)
 * Description: Given a 3-character book code and chapter number, create a #-# string
 * corresponding to [Paratext book code number]-[chapter number]
 * If the book is not found, returns -1
 * Note: Paratext seems to use book number 40 for Matthew in the "Assignments and Progress" tables 
 * (vs skipping book 40)
 */
function getBookChapterNumber(bookCode, chapter) {
  if (bookCode in booksObj) {
    return booksObj[bookCode].BookNum + "-" + chapter;
  }

  // Otherwise, invalid book code
  console.warn("Book code " + bookCode + " no found")
  return "-1";
}


/**
 * Function updateProgress
 * @param {object} progressObj  JSON object from the project reports which contains completed info
 * @param {object} xmlObj       JSON object of ProgressProgress.xml which is modified
 * @param {string} user         Paratext user for each updated status element
 * Description  Update the assignment and status sections of xmlObj for each Paratext phase.
 * xmlObj is modified during the process.
 */
function updateProgress(progressObj, xmlObj, user) {
  // Mapping from the "Progress and Planning" phases to the Paratext phases
  // typos match the spellings in Paratext
  const PPToParatextPhase = new Map
    ([['Exegesis & First Draft', 'Exegisis & First Draft'],
      ['Team Check', 'Team Checking'],
      ['Advisor check and back transaltion', 'Advisor check and back transaltion'],
      ['community testing', 'Community Testing'],
      ['Con-sultant Check', 'Consultant Check'],
      ['Pub-lished', 'Published']]);
  
  const ParatextPhaseToStageIndex = new Map
  ([['Exegisis & First Draft', 0],
  ['Team Checking', 1],
  ['Advisor check and back transaltion', 2],
  ['Community Testing', 3],
  ['Consultant Check', 4],
  ['Published', 5]]);

  let reportingDate = reportingInfo.getReportingDate();

  // Fill out progress for the project phase
  // Not using forEach to maintain context
  for (let bookCode in progressObj) {
    let bookObj = progressObj[bookCode];
    for (let ppPhase in bookObj) {
      let paratextPhase = PPToParatextPhase.get(ppPhase);

      let stageIndex;
      if (!ParatextPhaseToStageIndex.has(paratextPhase)) {
        console.error("Invalid translation phase: " + paratextPhase);
        continue;
      }
      stageIndex = ParatextPhaseToStageIndex.get(paratextPhase);
      
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
      let existingIndex = assignmentsArray.findIndex(el => el.book === bookCode);
      if (existingIndex == -1) {
        // Add new assignment
        let updatedAssignment = {};
        updatedAssignment.book = bookCode;
        assignmentsArray.push(updatedAssignment)
      }

      // Update Status node.
      let statusArray = task.Status
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
        let bookChapterNumber;
        if (paratextPhase == "Published") {
          // Publishing only deals with Chapter "0":
          // Could optimize this to not happen for each chapter
          bookChapterNumber = getBookChapterNumber(bookCode, 0);
        } else {
          bookChapterNumber = getBookChapterNumber(bookCode, ch);
        } 

        let updatedStatus = {};
        let existingIndex = statusArray.findIndex(el => el.bookChapter === bookChapterNumber);
        if (existingIndex != -1) {
          // Update existing status to "Done"
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

          statusArray.push(updatedStatus);
        }
      }
    }
  }
}

////////////////////////////////////////////////////////////////////
// Start
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
if (((process.argv.length == 3) && (process.argv[2]  == "-h" || process.argv[2] == "-?")) ||
    (process.argv.length < 5)) {
  displayUsage()
}

let user = process.argv[2];
let statusFilename = process.argv[3];
let projectPath = process.argv[4];
console.log("User: \"" + user + "\" processing status file: " + statusFilename);

// Check files exist
if (!fs.existsSync(statusFilename)) {
  console.error("Can't open status file " + statusFilename)
  process.exit(1)
}

let projectProgressFilename = path.join(projectPath, "ProjectProgress.xml");
if (!fs.existsSync(projectProgressFilename)) {
  console.error("Can't find Paratext file: " + projectProgressFilename);
  process.exit(1)
}

////////////////////////////////////////////////////////////////////
// End of parameters
////////////////////////////////////////////////////////////////////

// Determine the reporting quarter and year from the status filename
let statusFilenameArr = path.basename(statusFilename).split(/[-.]+/)
if (statusFilenameArr.length < 4) {
  console.error("Unable to determine reporting [project name, quarter, year] from " + statusFilename)
  process.exit(1)
}
let reportingInfo = new Reporting(statusFilenameArr[0], statusFilenameArr[1], statusFilenameArr[2]);

let progressData, progressObj;
progressData = fs.readFileSync(statusFilename);
progressObj = JSON.parse(progressData)

// Mapping of book names to book number (according to Paratext) and chapter numbers
const booksFilename = "books.json"
if (!fs.existsSync(booksFilename)) {
  console.error("Can't open book info file " + booksFilename)
  process.exit(1)
}
let booksData = fs.readFileSync(booksFilename);
let booksObj = JSON.parse(booksData);

// Make a backup of existing ProjectProgress.xml file
fs.copyFileSync(projectProgressFilename, projectProgressFilename + ".bak");

// Update ProjectProgress.xml
let projectProgressData = fs.readFileSync(projectProgressFilename,'utf-8');
let xmlObj = xmlParser.toJson(projectProgressData, {reversible: true, object: true})

// Update the project progress for xmlObj
updateProgress(progressObj, xmlObj, user);

// Convert back to XML and beautify
let options = {
  sanitize: true,
  ignoreNull: false
};
let updatedData = xmlParser.toXml(xmlObj, options);
updatedData = vkbeautify.xml(updatedData, 2);

// xmlParser loses the XML tags so append when writing back to file
let header = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
fs.writeFileSync(projectProgressFilename, header + updatedData);
console.info("Project " + reportingInfo.projectName + " updates written to " + projectProgressFilename);
