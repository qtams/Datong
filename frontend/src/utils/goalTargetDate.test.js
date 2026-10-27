import assert from "node:assert/strict";
import { test } from "node:test";
import { getDaysInMonth, parseTargetDate, targetDateValue, updateTargetDateParts } from "./goalTargetDate.js";

test("moving a 31st-day target to a shorter month keeps the date valid", () => {
  const january = parseTargetDate("2027-01-31");
  assert.equal(targetDateValue(updateTargetDateParts(january, { month: 2 })), "2027-02-28");
  assert.equal(targetDateValue(updateTargetDateParts(january, { month: 4 })), "2027-04-30");
});

test("changing the year adjusts a February 29 target for leap years", () => {
  const leapDay = parseTargetDate("2028-02-29");
  assert.equal(targetDateValue(updateTargetDateParts(leapDay, { year: 2029 })), "2029-02-28");
  assert.equal(getDaysInMonth(2100, 2), 28);
  assert.equal(getDaysInMonth(2000, 2), 29);
});

test("saved target dates round-trip without timezone conversions", () => {
  for (const value of ["2026-10-27", "2029-10-26", "2028-02-29", "2050-01-01"]) {
    assert.equal(targetDateValue(parseTargetDate(value)), value);
  }
});

test("optional, malformed, and impossible dates do not seed the wheels", () => {
  for (const value of ["", null, undefined, "2026-02-29", "2026-04-31", "2026-13-01", "2026-01-00", "0000-01-01", "2026-1-1", "invalid"]) {
    assert.equal(parseTargetDate(value), null);
  }
});
