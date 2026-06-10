/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RegisterUseCase } from "./register.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { RegisterCommand } from "@domain/auth/commands/register.command";
import { RegisterResponse } from "@core/lib/models/auth/http.model";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let repo: any;

  const command: RegisterCommand = {
    firstName: "Иван",
    lastName: "Иванов",
    birthday: "1990-01-01",
    email: "u@e.com",
    password: "p",
  };

  function setup(): void {
    repo = { register: vi.fn() };
    TestBed.configureTestingModule({
      providers: [RegisterUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(RegisterUseCase);
  }

  it("делегирует вызов в репозиторий", () => {
    setup();
    repo.register.mockReturnValue(of({} as RegisterResponse));

    useCase.execute(command).subscribe();

    expect(repo.register).toHaveBeenCalledExactlyOnceWith(command);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.register.mockReturnValue(of({} as RegisterResponse));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при 500 возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.register.mockReturnValue(throwError(() => ({ status: 500 })));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));

  it("при 400 возвращает fail { kind: 'validation_error' } с полями из error.error", () =>
    new Promise<void>(done => {
      setup();
      const fieldErrors = { email: ["уже занят"] };
      repo.register.mockReturnValue(throwError(() => ({ status: 400, error: fieldErrors })));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok && result.error.kind === "validation_error") {
          expect(result.error.errors).toEqual(fieldErrors as never);
        } else {
          throw new Error("ожидали validation_error");
        }
        done();
      });
    }));

  it("при прочих ошибках возвращает fail { kind: 'unknown' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = { status: 418 };
      repo.register.mockReturnValue(throwError(() => err));

      useCase.execute(command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok && result.error.kind === "unknown") {
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
