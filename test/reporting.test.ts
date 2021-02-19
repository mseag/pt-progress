// Copyright 2021 SIL International
// Trivial unit test for testing reporting
const test = require('ava');

import * as Reporting from '../dist/reporting'

test('reporting.isQuarter()', t => {
  t.truthy(Reporting.isQuarter("Q1"));
  t.truthy(Reporting.isQuarter("Q2"));
  t.truthy(Reporting.isQuarter("Q3"));
  t.truthy(Reporting.isQuarter("Q4"));
  t.falsy(Reporting.isQuarter("25%"));
  t.falsy(Reporting.isQuarter("50%"));
  t.falsy(Reporting.isQuarter("75%"));
  // Cannot assign invalid QuarterType
  //t.assert(Reporting.isQuarter("QCustom") === false);
})
