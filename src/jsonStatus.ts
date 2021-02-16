// Copyright 2020-2021 SIL International
import * as fs from 'fs';
import * as path from 'path';
import * as reporting from './reporting';
import {ProjectStatusType, StatusMap, Status} from "./status";

export class JsonStatus {
  public JSON_EXTENSION = ".json";

  /**
   * Get a project's reporting info from the JSON filename
   * @param {string} jsonFile Path to the JSON file
   * @returns {reporting.Reporting}
   */
  public getReportingInfo(jsonFile: string): reporting.Reporting {
    if (!jsonFile.endsWith(this.JSON_EXTENSION)) {
      console.error(jsonFile + " does not end with '.json'. Exiting");
      process.exit(1);
    }
    // Get the filename without extension
    const filename: string = path.basename(jsonFile, this.JSON_EXTENSION);
    const components: string[] = filename.split("-");
    if (components.length != 3) {
      console.error(jsonFile + " does not have 3 components (project name, quarter, year). Exiting");
      process.exit(1);
    }

    const projectTitle: string = components[0];
    const quarter: reporting.QuarterType = components[1] as reporting.QuarterType;
    if (!reporting.isQuarter(quarter)) {
      console.error(quarter + " is not in (Q1, Q2, Q3, Q4). Exiting");
      process.exit(1);
    }
    const year: string = components[2];
    return new reporting.Reporting(projectTitle, quarter, parseInt(year));
  }

  /**
   * Load a project's JSON status file
   * @param {string} jsonFile Path to the JSON file
   * @param {reporting.Reporting} reportingInfo
   */
  public loadStatus(jsonFile: string) :
      ProjectStatusType {
    const rawdata = fs.readFileSync(jsonFile).toString();
    const projectStatus: ProjectStatusType = JSON.parse(rawdata);
    return projectStatus;
  }
}
