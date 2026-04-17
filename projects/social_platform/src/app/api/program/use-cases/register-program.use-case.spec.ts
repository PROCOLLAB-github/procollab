/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RegisterProgramUseCase } from "./register-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";

describe("RegisterProgramUseCase", () => {
  let useCase: RegisterProgramUseCase;
  let repositoryPort: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repositoryPort = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "register",
    ]);

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
    repositoryPort.register.and.returnValue(of({} as null));

    useCase.execute(42, { city: "Москва" }).subscribe();

    expect(repositoryPort.register).toHaveBeenCalledOnceWith(42, { city: "Москва" });
  });

  it("при успехе возвращает Result.ok с данными из репозитория", done => {
    setup();
    const payload = { city: { name: "Город", placeholder: "" } } as never;
    repositoryPort.register.and.returnValue(of(payload));

    useCase.execute(1, {}).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(payload);
      }
      done();
    });
  });

  it("при ошибке репозитория возвращает Result.fail с kind 'register_program_error'", done => {
    setup();
    const boom = new Error("network");
    repositoryPort.register.and.returnValue(throwError(() => boom));

    useCase.execute(1, {}).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("register_program_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
