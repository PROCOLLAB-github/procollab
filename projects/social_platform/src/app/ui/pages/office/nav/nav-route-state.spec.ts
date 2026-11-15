/** @format */
import { isProgramsSectionActive } from "./nav.component";

describe("Выделение пункта программ", () => {
  it.each([
    "/office/program/all",
    "/office/program/all?search=test",
    "/office/program/all;view=grid",
    "/office/program/create",
    "/office/program/12/launch",
    "/office/program/12/management/settings?tab=dates",
    "/office/program/12/preview",
  ])("выделяет программы на маршруте %s", url => {
    expect(isProgramsSectionActive(url)).toBe(true);
  });

  it.each(["/office/program/managed", "/office/program/manager", "/office/projects/12"])(
    "не подменяет выбранный пункт на маршруте %s",
    url => expect(isProgramsSectionActive(url)).toBe(false),
  );
});
