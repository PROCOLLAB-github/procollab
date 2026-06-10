/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SendProjectAdditionalFieldsUseCase } from "./send-project-additional-fields.use-case";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { Project } from "@domain/project/project.model";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";

describe("SendProjectAdditionalFieldsUseCase", () => {
  let useCase: SendProjectAdditionalFieldsUseCase;
  let repo: any;

  function setup(): void {
    repo = { sendNewProjectFieldsValues: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        SendProjectAdditionalFieldsUseCase,
        { provide: ProjectProgramRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(SendProjectAdditionalFieldsUseCase);
  }

  const values: ProjectNewAdditionalProgramFields[] = [];

  it("делегирует (projectId, newValues) в sendNewProjectFieldsValues", () => {
    setup();
    repo.sendNewProjectFieldsValues.mockReturnValue(of({} as Project));

    useCase.execute(1, values).subscribe();

    expect(repo.sendNewProjectFieldsValues).toHaveBeenCalledExactlyOnceWith(1, values);
  });

  it("при успехе возвращает ok с проектом", () =>
    new Promise<void>(done => {
      setup();
      const project = {} as Project;
      repo.sendNewProjectFieldsValues.mockReturnValue(of(project));

      useCase.execute(1, values).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(project);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'send_project_additional_fields_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.sendNewProjectFieldsValues.mockReturnValue(throwError(() => err));

      useCase.execute(1, values).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("send_project_additional_fields_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
