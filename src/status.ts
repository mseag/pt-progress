// Copyright 2020-2021 SIL International
// Type for Excel, Word, or Paratext project status that gets saved to JSON.
// The status from Excel/Word can be used to update a Paratext project.
// The status from Paratext can be exported to Word table.
import * as books from './books';
import {PhaseType} from './phase';
import * as reporting from './reporting';

export type StatusMap = {
  [phase in PhaseType ]?: Status
};

export type ProjectStatusType = { [code in books.CodeType]? : StatusMap[] };

export class Status {
  chapters: number;               // Completed chapters
  startingChapter: number;        // Starting chapter number for the unit of work
  quarter: reporting.QuarterType; // Which quarter the chapters were completed in [Q1, Q2, Q3, Q4]
  year: number;                   // Which year the chapters were completed in

  constructor(chapters: number, startingChapter: number,
      quarter: reporting.QuarterType, year: number) {
    this.chapters = chapters;
    this.startingChapter = startingChapter;
    this.quarter = quarter;
    this.year = year;
  }

}
