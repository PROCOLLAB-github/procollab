/** @format */
import { authLoginUrl, authReturnUrl } from "./auth-return-url";
describe("Безопасный возврат после входа", () => {
  it("сохраняет программу, фильтры, сортировку и fragment", () => {
    const url = "/office/program/7/management/participants?region=Москва&order=activity_asc#list";
    expect(authReturnUrl(url)).toBe(url);
    expect(authLoginUrl(url)).toBe("/auth/login?returnUrl=" + encodeURIComponent(url));
  });
  it.each([
    undefined,
    null,
    7,
    "https://example.test/office",
    "//example.test",
    "/\\example.test",
    "/auth/login",
    "/office-other",
    "/office/\\example.test",
    "/office/\nexample",
  ])("не принимает внешний или неподходящий маршрут: %j", value => {
    expect(authReturnUrl(value)).toBeNull();
    expect(authLoginUrl(value)).toBe("/auth/login");
  });
});
