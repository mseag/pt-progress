#!/usr/bin/env node
// Copyright 2020-2021 SIL International
import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as excelProject from './excelProject';
import * as paratextProgress from './paratextProgress';
import { ProjectStatusType } from './status';
import { Reporting } from './reporting';
import * as convert from 'xml-js';
import * as vkbeautify from 'vkbeautify';
import * as jsonStatus from './jsonStatus';
const {version} = require('../package.json');

// TODO: Use docx-tables or mammoth to parse .docx files

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
  .version(version, '-v, --version', 'output the current version')
  .description("Utilities to 1) parse a quarterly report from the \"Progress\" sheet of a P&P Excel spreadsheet. " +
    "The status is written to a file [project name]-[reporting quarter]-[reporting year].json and " +
    "2) take a JSON status file to update the Paratext progress.")
  .option("-x, --xlsm <excelProjectPath>", "path to P&P Excel spreadsheet")
  .option("-j, --json <jsonStatusPath>", "path to JSON status file (named project-quarter-year.json)")
  .option("-p, --project <paratextProjectPath>", "path to the Paratext project")
  .option("-t, --table", "Export a Paratext project progress into MS Word tables (not implemented yet)")
  .option("-u, --user <name>", "Paratext user name that will be updating the Paratext project status")
  .parse(process.argv);

// Debugging parameters
const options = program.opts();
const debugParameters = true;
if (debugParameters) {
  console.log('Parameters:');
  if (options.xlsm) {
    console.log(`P&P Excel file: "${options.xlsm}"`);
  }
  if (options.json) {
    console.log(`JSON file: "${options.json}"`);
  }
  if (options.project) {
    console.log(`Paratext Project: "${options.project}"`);
  }
  if (options.table) {
    console.log(`Export progress to MS Word Table`);
  }
  if (options.user) {
    console.log(`User: "${options.user}"`);
  }
  console.log('\n');
}

// Check if Excel/JSON file exists
if (options.xlsm && !fs.existsSync(options.xlsm)) {
  console.error("Can't open P&P Excel file " + options.xlsm);
  process.exit(1);
}
if (options.json && !fs.existsSync(options.json)) {
  console.error("Can't open JSON file " + options.json);
  process.exit(1);
}

////////////////////////////////////////////////////////////////////
// End of parameters
////////////////////////////////////////////////////////////////////

let reportingInfo: Reporting = new Reporting(
  "Invalid", "Q1", 2020);
let progressObj: ProjectStatusType = { "000": undefined };

if (options.xlsm) {
  // Determine the reporting quarter and year from the Excel file
  const ep = new excelProject.ExcelProject();
  reportingInfo = ep.getReportingInfo(options.xlsm);

  // Get the project status from the Excel file
  progressObj = ep.exportStatus(options.xlsm, reportingInfo);
} else if (options.json) {
  // Determine the reporting quarter and year from the JSON file
  const jStatus = new jsonStatus.JsonStatus();
  reportingInfo = jStatus.getReportingInfo(options.json);

  // Get the project status from the JSON file
  try {
    progressObj = jStatus.loadStatus(options.json);
  } catch (e) {
    console.error("Invalid JSON file. Exiting")
    process.exit(1);
  }
} else if (!options.table) {
  console.warn("No Excel or JSON path given. Exiting");
  process.exit(1);
}

// If Paratext user name and project path given, update Paratext progress
if (options.project) {
  // Check if Paratext project exists
  const PARATEXT_PROJECT_PROGRESS = "ProjectProgress.xml";
  const projectProgressFilename = path.join(options.project, PARATEXT_PROJECT_PROGRESS);
  if (!fs.existsSync(projectProgressFilename)) {
    console.error("Can't find Paratext file: " + projectProgressFilename);
    process.exit(1)
  }

  // Read existing ProjectProgress.xml into xmlObj which will get updated
  const projectProgressData = fs.readFileSync(projectProgressFilename, 'utf-8');
  const xmlObj = convert.xml2js(projectProgressData, {compact: true})

  const p = new paratextProgress.ParatextProgress();
  if (options.table) {
    // Convert the data from Paratext to projectObj and export to MS Word table and exit
    const projectName = path.basename(options.project);
    progressObj = p.exportStatus(xmlObj, projectName);

    process.exit(1);
  }

  if (options.user) {
    // Make a backup of existing ProjectProgress.xml file
    fs.copyFileSync(projectProgressFilename, projectProgressFilename + ".bak");

    // Update Paratext progress
    p.update(progressObj, xmlObj, options.user, reportingInfo);

    // Convert xmlObj to XML and beautify before writing
    const xmlOptions = {
      compact: true,
      fullTagEmptyElement: false,
      ignoreComment: true,
      spaces: 4
    };
    let updatedData = convert.js2xml(xmlObj, xmlOptions);
    updatedData = vkbeautify.xml(updatedData, 2);

    // Write the XML to file
    fs.writeFileSync(projectProgressFilename, updatedData);
    console.info(`SUCCESS! Project ${reportingInfo.projectName} updates written to ${projectProgressFilename}`);
  }
}
