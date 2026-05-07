/** @format */

import { AuthService } from "projects/social_platform/src/app/api/auth";
import { UserRolePipe } from "../user-role.pipe";
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
