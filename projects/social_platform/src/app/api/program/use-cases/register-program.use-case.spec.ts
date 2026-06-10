/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RegisterProgramUseCase } from "./register-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramDataSchema } from "@domain/program/program.model";

describe("RegisterProgramUseCase", () => {
  let useCase: RegisterProgramUseCase;
  let repositoryPort: any;

  function setup(): void {
    repositoryPort = { register: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        RegisterProgramUseCase,
        { provide: ProgramRepositoryPort, useValue: repositoryPort },
      ],
    });

    useCase = TestBed.inject(RegisterProgramUseCase);
  }

  it("делегирует вызов в репозиторий с теми же аргументами", () => {
    setup();
    repositoryPort.register.mockReturnValue(of({} as ProgramDataSchema));

    useCase.execute(42, { city: "Москва" }).subscribe();

    expect(repositoryPort.register).toHaveBeenCalledExactlyOnceWith(42, { city: "Москва" });
  });

  it("при успехе возвращает Result.ok с данными из репозитория", () =>
    new Promise<void>(done => {
      setup();
      const payload = { city: { name: "Город", placeholder: "" } } as never;
      repositoryPort.register.mockReturnValue(of(payload as ProgramDataSchema));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe(payload);
        }
        done();
      });
    }));

  it("при ошибке репозитория возвращает Result.fail с kind 'register_program_error'", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("network");
      repositoryPort.register.mockReturnValue(throwError(() => boom));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("register_program_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
