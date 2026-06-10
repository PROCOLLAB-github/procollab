/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LeaveProjectUseCase } from "./leave-project.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";

describe("LeaveProjectUseCase", () => {
  let useCase: LeaveProjectUseCase;
  let repo: any;

  function setup(): void {
    repo = { deleteLeave: vi.fn() };
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
    repo.deleteLeave.mockReturnValue(of(undefined));

    useCase.execute(1).subscribe();

    expect(repo.deleteLeave).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteLeave.mockReturnValue(of(undefined));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'leave_project_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deleteLeave.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("leave_project_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
