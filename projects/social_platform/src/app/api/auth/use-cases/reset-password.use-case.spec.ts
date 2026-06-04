/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ResetPasswordUseCase } from "./reset-password.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let repo: any;

  function setup(): void {
    repo = { resetPassword: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ResetPasswordUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ResetPasswordUseCase);
  }

  it("делегирует email в репозиторий", () => {
    setup();
    repo.resetPassword.mockReturnValue(of(undefined));

    useCase.execute("u@e.com").subscribe();

    expect(repo.resetPassword).toHaveBeenCalledExactlyOnceWith("u@e.com");
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.resetPassword.mockReturnValue(of(undefined));

      useCase.execute("u@e.com").subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.resetPassword.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute("u@e.com").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("network");
        done();
      });
    }));
});
