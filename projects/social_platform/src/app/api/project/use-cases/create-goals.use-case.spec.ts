/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreateGoalsUseCase } from "./create-goals.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@domain/project/goal-form-data.model";

describe("CreateGoalsUseCase", () => {
  let useCase: CreateGoalsUseCase;
  let repo: any;

  function setup(): void {
    repo = { createGoal: vi.fn() };
    TestBed.configureTestingModule({
      providers: [CreateGoalsUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CreateGoalsUseCase);
  }

  it("делегирует (projectId, goals) в createGoal", () => {
    setup();
    repo.createGoal.mockReturnValue(of([]));
    const goals: GoalFormData[] = [];

    useCase.execute(1, goals).subscribe();

    expect(repo.createGoal).toHaveBeenCalledExactlyOnceWith(1, goals);
  });

  it("при успехе возвращает ok с созданными целями", () =>
    new Promise<void>(done => {
      setup();
      const created: Goal[] = [];
      repo.createGoal.mockReturnValue(of(created));

      useCase.execute(1, []).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(created);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'create_project_goals_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.createGoal.mockReturnValue(throwError(() => err));

      useCase.execute(1, []).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("create_project_goals_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
