/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ResendEmailUseCase } from "./resend-email.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";

describe("ResendEmailUseCase", () => {
  let useCase: ResendEmailUseCase;
  let repo: any;

  function setup(): void {
    repo = { resendEmail: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ResendEmailUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ResendEmailUseCase);
  }

  it("делегирует email в репозиторий", () => {
    setup();
    repo.resendEmail.mockReturnValue(of({} as User));

    useCase.execute("u@e.com").subscribe();

    expect(repo.resendEmail).toHaveBeenCalledExactlyOnceWith("u@e.com");
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.resendEmail.mockReturnValue(of({} as User));

      useCase.execute("u@e.com").subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.resendEmail.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute("u@e.com").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("network");
        done();
      });
    }));
});
