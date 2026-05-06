/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateGoalUseCase } from "./update-goal.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@infrastructure/adapters/project/dto/project-goal.dto";

describe("UpdateGoalUseCase", () => {
  let useCase: UpdateGoalUseCase;
  let repo: jasmine.SpyObj<ProjectGoalsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectGoalsRepositoryPort>("ProjectGoalsRepositoryPort", [
      "editGoal",
    ]);
    TestBed.configureTestingModule({
      providers: [UpdateGoalUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(UpdateGoalUseCase);
  }

  const goal = {} as GoalFormData;

  it("делегирует (projectId, goalId, goal) в editGoal", () => {
    setup();
    repo.editGoal.and.returnValue(of({} as Goal));

    useCase.execute(1, 42, goal).subscribe();

    expect(repo.editGoal).toHaveBeenCalledOnceWith(1, 42, goal);
  });

  it("при успехе возвращает ok с обновлённой целью", done => {
    setup();
    const updated = {} as Goal;
    repo.editGoal.and.returnValue(of(updated));

    useCase.execute(1, 42, goal).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(updated);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'update_project_goal_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.editGoal.and.returnValue(throwError(() => err));

    useCase.execute(1, 42, goal).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("update_project_goal_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
