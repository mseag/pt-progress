#!/usr/bin/env node
// Copyright 2020 SIL International

import * as fs from "fs";
import * as path from "path";
import * as progress from "./progress";
import * as reporting from "./reporting";
const program = require('commander');
const xmlParser = require('xml2json');
const vkbeautify = require('vkbeautify');

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
  .version("0.1.0")
  .description("Parse a status file into a Paratext project")
  .requiredOption("-u, --user <name>", "Paratext user name that will be updating the Paratext project status")
  .requiredOption("-s, --status <filename>", "JSON file created from the P&P Excel spreadsheet. " +
    "The filename should consist of [project name]-[reporting quarter]-[reporting year] (e.g. MEP-Q2-2020.json)" +
    "    This file contains info of book code, translation phase, and" +
    "    number of chapters completed in the reporting quarter")
  .requiredOption("-p, --project <path>", "path to the Paratext project")
  .parse(process.argv);

console.log("User: \"" + program.user + "\" processing status file: " + program.status + 
  " Project: " + program.project);

// Check files exist
if (!fs.existsSync(program.status)) {
  console.error("Can't open status file " + program.status)
  process.exit(1)
}

let projectProgressFilename = path.join(program.project, "ProjectProgress.xml");
if (!fs.existsSync(projectProgressFilename)) {
  console.error("Can't find Paratext file: " + projectProgressFilename);
  process.exit(1)
}

////////////////////////////////////////////////////////////////////
// End of parameters
////////////////////////////////////////////////////////////////////

// Determine the reporting quarter and year from the status filename
let statusFilenameArr = path.basename(program.status).split(/[-.]+/)
if (statusFilenameArr.length < 4) {
  console.error("Unable to determine reporting [project name, quarter, year] from " + program.status)
  process.exit(1)
}
let reportingInfo = new reporting.Reporting(statusFilenameArr[0], statusFilenameArr[1], statusFilenameArr[2]);

let progressData: string = fs.readFileSync(program.status, 'utf8');
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
p.updateProgress(booksObj, progressObj, xmlObj, program.user, reportingDate);

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
