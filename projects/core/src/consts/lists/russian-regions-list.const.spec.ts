/** @format */

import {
  filterRussianRegions,
  findCanonicalRussianRegion,
  russianRegions,
} from "./russian-regions-list.const";

describe("russianRegions", () => {
  it("contains a unique canonical list", () => {
    expect(russianRegions).toHaveLength(89);
    expect(new Set(russianRegions).size).toBe(russianRegions.length);
  });

  it.each([
    ["Москва", "Москва"],
    [" мОскВа ", "Москва"],
    ["санкт-петербург", "Санкт-Петербург"],
  ])("normalizes safe case and whitespace differences for %s", (value, expected) => {
    expect(findCanonicalRussianRegion(value)).toBe(expected);
  });

  it("does not guess misspelled or arbitrary legacy values", () => {
    expect(findCanonicalRussianRegion("Миксва")).toBeNull();
    expect(findCanonicalRussianRegion("Россия")).toBeNull();
  });

  it("filters by a case-insensitive substring", () => {
    expect(filterRussianRegions("  татар ")).toEqual(["Республика Татарстан"]);
  });

  it("ranks exact, prefix and substring matches deterministically", () => {
    expect(filterRussianRegions("моск").slice(0, 2)).toEqual(["Москва", "Московская область"]);
    expect(filterRussianRegions("Москов")).toEqual(["Московская область"]);
    expect(filterRussianRegions("Москва")).toEqual(["Москва"]);
  });
});
