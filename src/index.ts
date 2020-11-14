#!/usr/bin/env node
// Copyright 2020 SIL International
import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as excelProject from './excelProject';
import * as paratextProgress from './paratextProgress';
import { ProjectStatusType } from './status';
import { Reporting, isQuarter } from './reporting';
import * as xmlParser from 'xml2json';
import * as vkbeautify from 'vkbeautify';
import * as jsonStatus from './jsonStatus';
const {version} = require('../package.json');

// TODO: Use docx-tables or mammoth to parse .docx files

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
  .version(version, '-v, --version', 'output the current version')
  .description("Utilities to 1) parse the status from the \"Progress\" sheet of a P&P Excel spreadsheet. " +
    "The status is written to a file [project name]-[reporting quarter]-[reporting year].json and " +
    "2) take a JSON status file to update the Paratext progress.")
  .option("-x, --xlsm <excelProjectPath>", "path to P&P Excel spreadsheet")
  .option("-j, --json <jsonStatusPath>", "path to JSON status file (named project-quarter-year.json)")
  .option("-p, --project <paratextProjectPath>", "path to the Paratext project")
  .option("-q, --quarter <quarter>", "If specified, only update Paratext status for the current quarter [Q1, Q2, Q3, Q4]")
  .option("-t, --table", "Export a Paratext project progress into MS Word tables")
  .option("-u, --user <name>", "Paratext user name that will be updating the Paratext project status")
  .parse(process.argv);

// Debugging parameters
const debugParameters = true;
if (debugParameters) {
  console.log('Parameters:');
  if (program.xlsm) {
    console.log(`P&P Excel file: "${program.xlsm}"`);
  }
  if (program.json) {
    console.log(`JSON file: "${program.json}"`);
  }
  if (program.project) {
    console.log(`Paratext Project: "${program.project}"`);
  }
  if (program.quarter) {
    console.log(`Quarter: "${program.quarter}"`);
  }
  if (program.table) {
    console.log(`Export progress to MS Word Table`);
  }
  if (program.user) {
    console.log(`User: "${program.user}"`);
  }
}

// Check if Excel/JSON file exists
if (program.xlsm && !fs.existsSync(program.xlsm)) {
  console.error("Can't open P&P Excel file " + program.xlsm);
  process.exit(1);
}
if (program.json && !fs.existsSync(program.json)) {
  console.error("Can't open JSON file " + program.json);
  process.exit(1);
}

if (program.quarter) {
  if (!isQuarter(program.quarter)) {
    console.error(`Quarter needs to be one of [Q1, Q2, Q3, Q4]`);
    process.exit(1);
  }
}

////////////////////////////////////////////////////////////////////
// End of parameters
////////////////////////////////////////////////////////////////////

let reportingInfo: Reporting = new Reporting(
  "Invalid", "Q1", "2020");
let progressObj: ProjectStatusType = { "000": undefined };

if (program.xlsm) {
  // Determine the reporting quarter and year from the Excel file
  const ep = new excelProject.ExcelProject();
  reportingInfo = ep.getReportingInfo(program.xlsm);

  // Get the project status from the Excel file
  progressObj = ep.exportStatus(program.xlsm, reportingInfo);
} else if (program.json) {
  // Determine the reporting quarter and year from the JSON file
  const jStatus = new jsonStatus.JsonStatus();
  reportingInfo = jStatus.getReportingInfo(program.json);

  // Get the project status from the JSON file
  progressObj = jStatus.loadStatus(program.json, reportingInfo);
} else if (!program.table) {
  console.warn("No Excel or JSON path given. Exiting");
  process.exit(1);
}

// If Paratext user name and project path given, update Paratext progress
if (program.project) {
  // Check if Paratext project exists
  const PARATEXT_PROJECT_PROGRESS = "ProjectProgress.xml";
  const projectProgressFilename = path.join(program.project, PARATEXT_PROJECT_PROGRESS);
  if (!fs.existsSync(projectProgressFilename)) {
    console.error("Can't find Paratext file: " + projectProgressFilename);
    process.exit(1)
  }

  // Read existing ProjectProgress.xml into xmlObj which will get updated
  const projectProgressData = fs.readFileSync(projectProgressFilename, 'utf-8');
  const xmlObj = xmlParser.toJson(projectProgressData, {reversible: true, object: true})

  const p = new paratextProgress.ParatextProgress();
  if (program.table) {
    // Convert the data from Paratext to projectObj and export to MS Word table and exit
    const projectName = path.basename(program.project);
    progressObj = p.exportStatus(xmlObj, projectName);

    process.exit(1);
  }

  if (program.user) {
    // Make a backup of existing ProjectProgress.xml file
    fs.copyFileSync(projectProgressFilename, projectProgressFilename + ".bak");

    // Update Paratext progress
    p.update(progressObj, xmlObj, program.user, reportingInfo, program.quarter);

    // Convert xmlObj to XML and beautify before writing
  const xmlOptions = {
    sanitize: true,
    ignoreNull: false
  };
  let updatedData = xmlParser.toXml(xmlObj, xmlOptions);
  updatedData = vkbeautify.xml(updatedData, 2);

  // xmlParser loses the XML tags so prepend when writing back to file
  const XML_HEADER = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
    fs.writeFileSync(projectProgressFilename, XML_HEADER + updatedData);
    console.info(`Project ${reportingInfo.projectName} updates written to ${projectProgressFilename}`);
  }
}
