// Copyright 2021 SIL International
// Trivial unit test for testing reporting
import anyTest, {TestInterface} from 'ava';

import { readFileSync } from 'fs';
import { join } from 'path';
import * as paratextProgress from '../dist/paratextProgress';
import * as reporting from '../dist/reporting';
import { ProjectStatusType } from '../dist/status';

// Reference: https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#typing-tcontext
const test = anyTest as TestInterface<{xmlObj: any}>;

test.beforeEach(t => {
  // Empty project progress from "XML" file
  const xmlString: string = readFileSync(join(__dirname, "xmlObj.json"), "utf-8");
  t.context.xmlObj = JSON.parse(xmlString);
});

test('paratextProgress.getBookChapterNumber()', t => {
  const p = new paratextProgress.ParatextProgress();
  // OT
  t.deepEqual(p.getBookChapterNumber("GEN", 50), "1-50", "Genesis (50 chapters)");
  t.deepEqual(p.getBookChapterNumber("MAL", 4), "39-4", "Malachi (4 chapters)");

  // NT
  t.deepEqual(p.getBookChapterNumber("MAT", 28), "40-28", "Matthew (28 chapters)");
  t.deepEqual(p.getBookChapterNumber("REV", 22), "66-22", "Revelation (22 chapters)");

  // Placeholder for invalid book
  t.deepEqual(p.getBookChapterNumber("000", 4), "0-4", "Placeholder book");
});

test.todo('getBookChapterNumber("INV", "4") is invalid book');

test('paratextProgress.update()', t => {
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
  const user = "tester";
  const p = new paratextProgress.ParatextProgress();

  // Assert Status doesn't exist yet
  t.deepEqual(xmlObj.ProgressInfo.Stages.Stage[0].Task.Status, undefined);

  // "Update" the project
  p.update(progressObj, xmlObj, user, reportingInfo);

  // Stage[0] for "exegesis"
  const status = xmlObj.ProgressInfo.Stages.Stage[0].Task.Status;
  //console.log(status[0]._attributes);

  // Assert completion
  for(let ch = 0; ch<16; ch++) {
    const expectedStatus: paratextProgress.projectStatusType = {
      _attributes: {
        bookChapter: "41-" + (ch+1).toString(),
        done: 'true',
        user: user,
        date: "2020-09-28T09:19:56.0972475+07:00"
      }
    }
    t.deepEqual(status[ch], expectedStatus, "Chapter status doesn't match");
  }
});
