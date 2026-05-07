/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramDataSchemaUseCase } from "./get-program-data-schema.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramDataSchema } from "@domain/program/program.model";

describe("GetProgramDataSchemaUseCase", () => {
  let useCase: GetProgramDataSchemaUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", ["getDataSchema"]);
    TestBed.configureTestingModule({
      providers: [GetProgramDataSchemaUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramDataSchemaUseCase);
  }

  it("делегирует programId в getDataSchema", () => {
    setup();
    repo.getDataSchema.and.returnValue(of({} as ProgramDataSchema));

    useCase.execute(1).subscribe();

    expect(repo.getDataSchema).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok со схемой", done => {
    setup();
    const schema = {} as ProgramDataSchema;
    repo.getDataSchema.and.returnValue(of(schema));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(schema);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_program_data_schema_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getDataSchema.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_program_data_schema_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
