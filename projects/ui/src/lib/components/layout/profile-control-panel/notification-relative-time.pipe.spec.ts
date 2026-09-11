/** @format */

import { formatNotificationRelativeTime } from "./notification-relative-time.pipe";

describe("formatNotificationRelativeTime", () => {
  const now = Date.parse("2026-09-12T12:00:00Z");

  it.each([
    ["2026-09-12T11:59:45Z", "только что"],
    ["2026-09-12T11:55:00Z", "5 мин назад"],
    ["2026-09-12T10:00:00Z", "2 ч назад"],
    ["2026-09-11T12:00:00Z", "1 д назад"],
    ["2026-09-01T12:00:00Z", "01.09.2026"],
  ])("форматирует %s как %s", (value, expected) => {
    expect(formatNotificationRelativeTime(value, now)).toBe(expected);
  });

  it("не выводит некорректную дату", () => {
    expect(formatNotificationRelativeTime("not-a-date", now)).toBe("");
  });
});
