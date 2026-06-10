/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LoginUseCase } from "./login.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoginCommand } from "@domain/auth/commands/login.command";
import { LoginResponse } from "@core/lib/models/auth/http.model";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let repo: any;

  const command: LoginCommand = { email: "u@e.com", password: "p" };
  const tokens: LoginResponse = { access: "a", refresh: "r" };

  function setup(): void {
    repo = { login: vi.fn() };
    TestBed.configureTestingModule({
      providers: [LoginUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(LoginUseCase);
  }

  it("делегирует вызов в репозиторий с командой", () => {
    setup();
    repo.login.mockReturnValue(of(tokens));

    useCase.execute(command).subscribe();

    expect(repo.login).toHaveBeenCalledExactlyOnceWith(command);
  });

  it("при успехе возвращает ok с токенами внутри LoginResult", () =>
    new Promise<void>(done => {
      setup();
      repo.login.mockReturnValue(of(tokens));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value.tokens).toEqual(tokens);
        done();
      });
    }));

  it("при 401 возвращает fail { kind: 'wrong_credentials' }", () =>
    new Promise<void>(done => {
      setup();
      repo.login.mockReturnValue(throwError(() => ({ status: 401 })));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("wrong_credentials");
        done();
      });
    }));

  it("при прочих ошибках возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.login.mockReturnValue(throwError(() => ({ status: 500 })));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
