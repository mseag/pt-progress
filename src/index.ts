#!/usr/bin/env node
// Copyright 2020 SIL International
import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import * as excelProject from "./excelProject";
import * as paratextProgress from "./paratextProgress";
import { isQuarter } from "./reporting";
const xmlParser = require('xml2json');
const vkbeautify = require('vkbeautify');
const {version} = require('../package.json');
////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
  .version(version, '-v, --version', 'output the current version')
  .description("Parse the status from the \"Progress\" sheet of a P&P Excel spreadsheet. " +
    "The status is written to a file [project name]-[reporting quarter]-[reporting year].json along " +
    "with the Paratext progress.")
  .requiredOption("-x, --xlsm <excelProjectPath>", "path to P&P Excel spreadsheet")
  .option("-p, --project <paratextProjectPath>", "path to the Paratext project")
  .option("-q, --quarter <quarter>", "If specified, only update Paratext status for the current quarter [Q1, Q2, Q3, Q4]")
  .option("-u, --user <name>", "Paratext user name that will be updating the Paratext project status")
  .parse(process.argv);

// Debugging parameters
const debugParameters = true;
if (debugParameters) {
  console.log('Parameters:');
  console.log(`P&P Excel file: "${program.xlsm}"`);
  if (program.project) {
    console.log(`Paratext Project: "${program.project}"`);
  }
  if (program.quarter) {
    console.log(`Quarter: "${program.quarter}`);
  }
  if (program.user) {
    console.log(`User: "${program.user}"`);
  }
}

// Check if Excel file exists
if (!fs.existsSync(program.xlsm)) {
  console.error("Can't open P&P Excel file " + program.xlsm);
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

// Determine the reporting quarter and year from the Excel file
const ep = new excelProject.ExcelProject();
const reportingInfo = ep.getReportingInfo(program.xlsm);

// Get the status from the Excel file
const progressObj: excelProject.ExcelProjectStatusType =
  ep.exportStatus(program.xlsm, reportingInfo);

// If Paratext user name and project path given, update Paratext progress
if (program.user && program.project) {
  // Check if Paratext project exists
  const PARATEXT_PROJECT_PROGRESS = "ProjectProgress.xml";
  const projectProgressFilename = path.join(program.project, PARATEXT_PROJECT_PROGRESS);
  if (!fs.existsSync(projectProgressFilename)) {
    console.error("Can't find Paratext file: " + projectProgressFilename);
    process.exit(1)
  }

  // Make a backup of existing ProjectProgress.xml file
  fs.copyFileSync(projectProgressFilename, projectProgressFilename + ".bak");

  // Read existing ProjectProgress.xml into xmlObj which will get updated
  const projectProgressData = fs.readFileSync(projectProgressFilename, 'utf-8');
  const xmlObj = xmlParser.toJson(projectProgressData, {reversible: true, object: true})

  // Update Paratext progress
  const p = new paratextProgress.ParatextProgress();
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
