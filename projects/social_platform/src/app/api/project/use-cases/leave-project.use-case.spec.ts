/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LeaveProjectUseCase } from "./leave-project.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";

describe("LeaveProjectUseCase", () => {
  let useCase: LeaveProjectUseCase;
  let repo: jasmine.SpyObj<ProjectCollaboratorsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectCollaboratorsRepositoryPort>(
      "ProjectCollaboratorsRepositoryPort",
      ["deleteLeave"]
    );
    TestBed.configureTestingModule({
      providers: [
        LeaveProjectUseCase,
        { provide: ProjectCollaboratorsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(LeaveProjectUseCase);
  }

  it("делегирует (projectId) в deleteLeave", () => {
    setup();
    repo.deleteLeave.and.returnValue(of(undefined));

    useCase.execute(1).subscribe();

    expect(repo.deleteLeave).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.deleteLeave.and.returnValue(of(undefined));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'leave_project_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.deleteLeave.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("leave_project_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
