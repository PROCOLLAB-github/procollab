/** @format */
/// <reference types="jasmine" />

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AssignProjectProgramUseCase } from "./assign-project-program";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProjectAssign } from "@domain/project/project-assign.model";

describe("assignProjectToProgramUseCase", () => {
  let useCase: AssignProjectProgramUseCase;
  let repo: jasmine.SpyObj<ProjectProgramRepositoryPort>;

  function setup() {
    repo = jasmine.createSpyObj<ProjectProgramRepositoryPort>("ProjectProgramRepositoryPort", [
      "assignProjectToProgram",
    ]);
    TestBed.configureTestingModule({
      providers: [
        AssignProjectProgramUseCase,
        { provide: ProjectProgramRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(AssignProjectProgramUseCase);
  }

  it("передаем информацию о привязке в программу", () => {
    setup();
    repo.assignProjectToProgram.and.returnValue(of({} as ProjectAssign));

    useCase.execute(1, 1).subscribe();
    expect(repo.assignProjectToProgram).toHaveBeenCalledOnceWith(1, 1);
  });

  it("исполняем привязку проекта к программе и возвращаем ok с данными о проекте", done => {
    setup();

    const projectAssign = {
      newProjectId: 2,
      programLinkId: 2,
      partnerProgram: "1",
    } as ProjectAssign;
    repo.assignProjectToProgram.and.returnValue(of(projectAssign));

    useCase.execute(1, 1).subscribe(result => {
      expect(result.ok).toBeTrue();

      if (result.ok) expect(result.value).toBe(projectAssign);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.assignProjectToProgram.and.returnValue(throwError(() => err));

    useCase.execute(1, 1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("unknown");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
