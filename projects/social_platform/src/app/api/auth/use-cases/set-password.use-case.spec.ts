/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SetPasswordUseCase } from "./set-password.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("SetPasswordUseCase", () => {
  let useCase: SetPasswordUseCase;
  let repo: any;

  function setup(): void {
    repo = { setPassword: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SetPasswordUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SetPasswordUseCase);
  }

  it("делегирует пароль и токен в репозиторий", () => {
    setup();
    repo.setPassword.mockReturnValue(of(undefined));

    useCase.execute("newPass", "tok-123").subscribe();

    expect(repo.setPassword).toHaveBeenCalledExactlyOnceWith("newPass", "tok-123");
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.setPassword.mockReturnValue(of(undefined));

      useCase.execute("newPass", "tok-123").subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.setPassword.mockReturnValue(throwError(() => boom));

      useCase.execute("newPass", "tok").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("unknown");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
