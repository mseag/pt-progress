// Copyright 2021 SIL International
// Trivial unit test for testing reporting
const test = require('ava');

import * as fs from 'fs';
import * as path from 'path';
import * as paratextProgress from '../dist/paratextProgress';
import * as reporting from '../dist/reporting';
import { ProjectStatusType } from '../dist/status';
import Reporting from '../src/reporting';

test.beforeEach(t => {
  // Empty project progress from "XML" file
  const xmlString: string = fs.readFileSync(path.join(__dirname, "xmlObj.json"), "utf-8");
  t.context.xmlObj = JSON.parse(xmlString);
});

test('getBookChapterNumber()', t => {
  const p = new paratextProgress.ParatextProgress();
  // OT
  t.deepEqual(p.getBookChapterNumber("GEN", 50), "1-50");
  t.deepEqual(p.getBookChapterNumber("MAL", 4), "39-4");

  // NT
  t.deepEqual(p.getBookChapterNumber("MAT", 28), "40-28");
  t.deepEqual(p.getBookChapterNumber("REV", 22), "66-22");

  // Placeholder for invalid book
  t.deepEqual(p.getBookChapterNumber("000", 4), "0-4");
});

test.todo('getBookChapterNumber("INV", "4") is invalid book');

test('update()', t => {
  // status from the "JSON" file
  const progressObj: ProjectStatusType = {
    "MRK": [
      {
        "exegesis": {
            "startingChapter": 1,
            "chapters": 16,
            "quarter": "Q4",
            "year": 2020
        }
      }
    ]};

  // Setup empty project status
  const xmlObj: any = t.context.xmlObj;
  const reportingInfo: reporting.Reporting = new reporting.Reporting(
    "unit-test", "Q1", 2021);
  const p = new paratextProgress.ParatextProgress();

  // Assert Status doesn't exist
  t.deepEqual(xmlObj.ProgressInfo.Stages.Stage[0].Task.Status, undefined);

  // "Update" the project
  p.update(progressObj, xmlObj, "tester", reportingInfo);

  // Stage[0] for "exegesis"
  const status = xmlObj.ProgressInfo.Stages.Stage[0].Task.Status;
  //console.log(status[0]._attributes);

  // Assert completion
  for(let ch = 0; ch<16; ch++) {
    t.deepEqual(status[ch]._attributes.bookChapter, "41-" + (ch+1).toString());
    t.truthy(status[ch]._attributes.done);
    t.deepEqual(status[ch]._attributes.user, "tester")
    t.deepEqual(status[ch]._attributes.date, "2020-09-28T09:19:56.0972475+07:00");
  }
});
