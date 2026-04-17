/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ResendEmailUseCase } from "./resend-email.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";

describe("ResendEmailUseCase", () => {
  let useCase: ResendEmailUseCase;
  let repo: jasmine.SpyObj<AuthRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<AuthRepositoryPort>("AuthRepositoryPort", ["resendEmail"]);
    TestBed.configureTestingModule({
      providers: [ResendEmailUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ResendEmailUseCase);
  }

  it("делегирует email в репозиторий", () => {
    setup();
    repo.resendEmail.and.returnValue(of({} as User));

    useCase.execute("u@e.com").subscribe();

    expect(repo.resendEmail).toHaveBeenCalledOnceWith("u@e.com");
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.resendEmail.and.returnValue(of({} as User));

    useCase.execute("u@e.com").subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.resendEmail.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute("u@e.com").subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
