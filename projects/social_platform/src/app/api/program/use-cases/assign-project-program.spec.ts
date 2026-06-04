/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AssignProjectProgramUseCase } from "./assign-project-program";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProjectAssign } from "@domain/project/project-assign.model";

describe("assignProjectToProgramUseCase", () => {
  let useCase: AssignProjectProgramUseCase;
  let repo: any;

  function setup() {
    repo = { assignProjectToProgram: vi.fn() };
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
    repo.assignProjectToProgram.mockReturnValue(of({} as ProjectAssign));

    useCase.execute(1, 1).subscribe();
    expect(repo.assignProjectToProgram).toHaveBeenCalledExactlyOnceWith(1, 1);
  });

  it("исполняем привязку проекта к программе и возвращаем ok с данными о проекте", () =>
    new Promise<void>(done => {
      setup();

      const projectAssign = {
        newProjectId: 2,
        programLinkId: 2,
        partnerProgram: "1",
      } as ProjectAssign;
      repo.assignProjectToProgram.mockReturnValue(of(projectAssign));

      useCase.execute(1, 1).subscribe(result => {
        expect(result.ok).toBe(true);

        if (result.ok) expect(result.value).toBe(projectAssign);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.assignProjectToProgram.mockReturnValue(throwError(() => err));

      useCase.execute(1, 1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("unknown");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
