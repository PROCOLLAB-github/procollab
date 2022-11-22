/** @format */

import { UserRolePipe } from "./user-role.pipe";
import { AuthService } from "../../auth/services";
import { of } from "rxjs";

describe("UserRolePipe", () => {
  it("create an instance", () => {
    const authSpy = {
      roles: of([]),
    };
    const pipe = new UserRolePipe(authSpy as unknown as AuthService);
    expect(pipe).toBeTruthy();
  });
});
