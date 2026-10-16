/** @format */
import { memberFiltersFromUrl, memberFilterQueryParams } from "./member-filters";

describe("Контракт фильтров участников", () => {
  it.each([
    "x18,30",
    "18,30x",
    "30,18",
    "18,",
    "-1,30",
    "18.5,30",
    "999999999999999999,999999999999999999",
  ])("не отправляет некорректный возраст %s", age => {
    expect(memberFiltersFromUrl({ age })).toEqual({});
  });
  it("нормализует возраст, пробелы и явно сохраняет false", () => {
    expect(
      memberFiltersFromUrl({
        age: "018,030",
        fullname: " Анна   Иванова ",
        is_mospolytech_student: "false",
        unknown: "x",
      }),
    ).toEqual({ fullname: "Анна Иванова", age: "18,30", is_mospolytech_student: "false" });
  });
  it("массивы URL и неизвестные булевы значения не превращаются в фильтры", () => {
    expect(
      memberFiltersFromUrl({
        skills__contains: ["Angular", "CSS"],
        age: ["18,30"],
        is_mospolytech_student: "no",
      }),
    ).toEqual({});
  });
  it("сброс удаляет все пять ключей, включая возраст", () => {
    expect(memberFilterQueryParams({})).toEqual({
      fullname: null,
      skills__contains: null,
      speciality__icontains: null,
      age: null,
      is_mospolytech_student: null,
    });
  });
});
