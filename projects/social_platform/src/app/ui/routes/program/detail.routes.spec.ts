/** @format */

import { PROGRAM_DETAIL_ROUTES } from "./detail.routes";

describe("PROGRAM_DETAIL_ROUTES", () => {
  it("регистрирует analytics как вложенную вкладку detail программы", () => {
    const detailRoute = PROGRAM_DETAIL_ROUTES.find(route => route.path === "");
    const analyticsRoute = detailRoute?.children?.find(route => route.path === "analytics");

    expect(analyticsRoute?.component).toBeDefined();
  });

  it("перенаправляет legacy register URL на detail программы", () => {
    const registerRoute = PROGRAM_DETAIL_ROUTES.find(route => route.path === "register");

    expect(registerRoute).toMatchObject({
      path: "register",
      pathMatch: "full",
      redirectTo: "",
    });
    expect(registerRoute?.component).toBeUndefined();
    expect(registerRoute?.resolve).toBeUndefined();
  });
});
