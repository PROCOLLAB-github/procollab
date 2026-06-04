/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateGoalUseCase } from "./update-goal.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@domain/project/goal-form-data.model";

describe("UpdateGoalUseCase", () => {
  let useCase: UpdateGoalUseCase;
  let repo: any;

  function setup(): void {
    repo = { editGoal: vi.fn() };
    TestBed.configureTestingModule({
      providers: [UpdateGoalUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(UpdateGoalUseCase);
  }

  const goal = {} as GoalFormData;

  it("делегирует (projectId, goalId, goal) в editGoal", () => {
    setup();
    repo.editGoal.mockReturnValue(of({} as Goal));

    useCase.execute(1, 42, goal).subscribe();

    expect(repo.editGoal).toHaveBeenCalledExactlyOnceWith(1, 42, goal);
  });

  it("при успехе возвращает ok с обновлённой целью", () =>
    new Promise<void>(done => {
      setup();
      const updated = {} as Goal;
      repo.editGoal.mockReturnValue(of(updated));

      useCase.execute(1, 42, goal).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(updated);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'update_project_goal_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.editGoal.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42, goal).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("update_project_goal_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
