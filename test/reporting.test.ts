// Copyright 2021 SIL International
// Trivial unit test for testing reporting
import test from 'ava';

import { isQuarter } from '../dist/reporting'

test('reporting.isQuarter()', t => {
  t.truthy(isQuarter("Q1"), "Q1");
  t.truthy(isQuarter("Q2"), "Q2");
  t.truthy(isQuarter("Q3"), "Q3");
  t.truthy(isQuarter("Q4"), "Q4");
  t.falsy(isQuarter("25%"), "25%");
  t.falsy(isQuarter("50%"), "50%");
 // Cannot assign invalid QuarterType
  //t.falsy(isQuarter("QCustom"), "QCustom");
})
