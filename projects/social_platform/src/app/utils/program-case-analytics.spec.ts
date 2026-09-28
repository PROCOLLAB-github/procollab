/** @format */
import { caseErrorMessage, caseExportFilename, presentationHref } from "./program-case-analytics";
describe("Case analytics: ссылки и имена файлов", () => {
  it.each([
    null,
    "",
    "javascript:alert(1)",
    "data:text/html,test",
    "/private/file",
    "file:///secret",
  ])("не делает небезопасный адрес кликабельным: %s", address => {
    expect(presentationHref(address)).toBeNull();
  });
  it("сохраняет внешнюю HTTP(S) презентацию", () => {
    expect(presentationHref("https://example.org/present?id=42")).toBe(
      "https://example.org/present?id=42",
    );
  });
  it("scope остаётся явным даже при совпадении option с label", () => {
    const date = new Date("2026-09-28T12:00:00Z");
    expect(caseExportFilename("Программа", { scope: "selected", caseName: "A" }, date)).toBe(
      "projects_case - A - Программа - 28.09.26.xlsx",
    );
    const selected = caseExportFilename(
      "Программа",
      { scope: "selected", caseName: "Без выбранного кейса" },
      date,
    );
    const without = caseExportFilename("Программа", { scope: "without_case" }, date);
    expect(selected).not.toBe(without);
    expect(selected.endsWith(".xlsx")).toBe(true);
    expect(without).toContain("without_case");
    expect(
      caseExportFilename("Программа", { scope: "selected", caseName: '../bad:\n"x/\\' }, date),
    ).not.toMatch(/[\r\n:/"\\]/);
  });
  it.each(["unsupported", "invalid", "forbidden", "unauthorized", "not_found", "network"] as const)(
    "контролируемое сообщение %s",
    kind => {
      expect(caseErrorMessage({ kind })).toBeTruthy();
    },
  );
});
