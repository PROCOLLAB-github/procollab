/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteGoalUseCase } from "./delete-goal.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";

describe("DeleteGoalUseCase", () => {
  let useCase: DeleteGoalUseCase;
  let repo: any;

  function setup(): void {
    repo = { deleteGoal: vi.fn() };
    TestBed.configureTestingModule({
      providers: [DeleteGoalUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteGoalUseCase);
  }

  it("делегирует (projectId, goalId) в deleteGoal", () => {
    setup();
    repo.deleteGoal.mockReturnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteGoal).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteGoal.mockReturnValue(of(undefined));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'delete_project_goal_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deleteGoal.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("delete_project_goal_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
