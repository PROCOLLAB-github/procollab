/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectGoalsUseCase } from "./get-project-goals.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";

describe("GetProjectGoalsUseCase", () => {
  let useCase: GetProjectGoalsUseCase;
  let repo: jasmine.SpyObj<ProjectGoalsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectGoalsRepositoryPort>("ProjectGoalsRepositoryPort", [
      "fetchAll",
    ]);
    TestBed.configureTestingModule({
      providers: [GetProjectGoalsUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectGoalsUseCase);
  }

  it("делегирует projectId в fetchAll", () => {
    setup();
    repo.fetchAll.and.returnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с массивом целей", done => {
    setup();
    const goals: Goal[] = [];
    repo.fetchAll.and.returnValue(of(goals));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(goals);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_goals_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.fetchAll.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_goals_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
