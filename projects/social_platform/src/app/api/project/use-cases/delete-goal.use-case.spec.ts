/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteGoalUseCase } from "./delete-goal.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";

describe("DeleteGoalUseCase", () => {
  let useCase: DeleteGoalUseCase;
  let repo: jasmine.SpyObj<ProjectGoalsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectGoalsRepositoryPort>("ProjectGoalsRepositoryPort", [
      "deleteGoal",
    ]);
    TestBed.configureTestingModule({
      providers: [DeleteGoalUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteGoalUseCase);
  }

  it("делегирует (projectId, goalId) в deleteGoal", () => {
    setup();
    repo.deleteGoal.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteGoal).toHaveBeenCalledOnceWith(1, 42);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.deleteGoal.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'delete_project_goal_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.deleteGoal.and.returnValue(throwError(() => err));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("delete_project_goal_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
