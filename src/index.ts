#!/usr/bin/env node
// Copyright 2020 SIL International

import * as fs from "fs";
import * as path from "path";
import * as progress from "./progress";
import * as reporting from "./reporting";
const xmlParser = require('xml2json');
const vkbeautify = require('vkbeautify');

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

let user:string = process.argv[2];
let statusFilename: string = process.argv[3];
let projectPath: string = process.argv[4];
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
let reportingInfo = new reporting.Reporting(statusFilenameArr[0], statusFilenameArr[1], statusFilenameArr[2]);

let progressData: string = fs.readFileSync(statusFilename, 'utf8');
let progressObj = JSON.parse(progressData)

// Mapping of book names to book number (according to Paratext) and chapter numbers
const booksFilename = "books.json"
if (!fs.existsSync(booksFilename)) {
  console.error("Can't open book info file " + booksFilename)
  process.exit(1)
}
let booksData: string = fs.readFileSync(booksFilename, 'utf-8');
let booksObj = JSON.parse(booksData);

// Make a backup of existing ProjectProgress.xml file
fs.copyFileSync(projectProgressFilename, projectProgressFilename + ".bak");

// Update ProjectProgress.xml
let projectProgressData = fs.readFileSync(projectProgressFilename,'utf-8');
let xmlObj = xmlParser.toJson(projectProgressData, {reversible: true, object: true})

// Update the project progress for xmlObj
let reportingDate = reporting.getReportingDate(reportingInfo);
let p = new progress.Progress();
p.updateProgress(booksObj, progressObj, xmlObj, user, reportingDate);

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
