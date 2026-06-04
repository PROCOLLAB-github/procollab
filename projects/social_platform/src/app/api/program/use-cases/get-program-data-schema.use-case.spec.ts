/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramDataSchemaUseCase } from "./get-program-data-schema.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramDataSchema } from "@domain/program/program.model";

describe("GetProgramDataSchemaUseCase", () => {
  let useCase: GetProgramDataSchemaUseCase;
  let repo: any;

  function setup(): void {
    repo = { getDataSchema: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProgramDataSchemaUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramDataSchemaUseCase);
  }

  it("делегирует programId в getDataSchema", () => {
    setup();
    repo.getDataSchema.mockReturnValue(of({} as ProgramDataSchema));

    useCase.execute(1).subscribe();

    expect(repo.getDataSchema).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok со схемой", () =>
    new Promise<void>(done => {
      setup();
      const schema = {} as ProgramDataSchema;
      repo.getDataSchema.mockReturnValue(of(schema));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(schema);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_program_data_schema_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getDataSchema.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_program_data_schema_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
