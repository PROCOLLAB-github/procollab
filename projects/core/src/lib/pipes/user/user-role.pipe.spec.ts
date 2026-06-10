/** @format */

import { of } from "rxjs";
import { UserRolePipe } from "./user-role.pipe";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("UserRolePipe", () => {
  it("create an instance", () => {
    // Пайп зависит от AuthRepositoryPort.fetchUserRoles() (вызывается в инициализаторе поля).
    const repoStub = {
      fetchUserRoles: () => of([]),
    } as unknown as AuthRepositoryPort;
    const pipe = new UserRolePipe(repoStub);
    expect(pipe).toBeTruthy();
  });
});
