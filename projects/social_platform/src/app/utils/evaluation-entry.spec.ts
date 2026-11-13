/** @format */

import { isEvaluationEntry } from "./evaluation-entry";

describe("Pilot expert onboarding entry", () => {
  it.each([
    "/office/evaluation?program=4",
    "/office/evaluation/4/projects/8?returnUrl=%2Foffice%2Fevaluation",
    "/office/program/4/projects-rating",
  ])("keeps the existing expert deep link %s", url => {
    expect(isEvaluationEntry(url, false)).toBe(true);
  });
  it.each([
    "/office/program/managed",
    "/office/program/4",
    "/office/program/4/management/analytics",
    "/office/projects/8?programLinkId=7",
  ])("lets a pilot expert start with %s without changing the ordinary mode", url => {
    expect(isEvaluationEntry(url, true)).toBe(true);
    expect(isEvaluationEntry(url, false)).toBe(false);
  });
  it.each([
    "/office/profile/4",
    "/office/feed",
    "/office/evaluation-other",
    "/office/projects/all",
  ])("keeps unrelated onboarding for %s", url => expect(isEvaluationEntry(url, true)).toBe(false));
});
