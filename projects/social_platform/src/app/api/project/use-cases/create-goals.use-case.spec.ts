/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreateGoalsUseCase } from "./create-goals.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@infrastructure/adapters/project/dto/project-goal.dto";

describe("CreateGoalsUseCase", () => {
  let useCase: CreateGoalsUseCase;
  let repo: jasmine.SpyObj<ProjectGoalsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectGoalsRepositoryPort>("ProjectGoalsRepositoryPort", [
      "createGoal",
    ]);
    TestBed.configureTestingModule({
      providers: [CreateGoalsUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CreateGoalsUseCase);
  }

  it("делегирует (projectId, goals) в createGoal", () => {
    setup();
    repo.createGoal.and.returnValue(of([]));
    const goals: GoalFormData[] = [];

    useCase.execute(1, goals).subscribe();

    expect(repo.createGoal).toHaveBeenCalledOnceWith(1, goals);
  });

  it("при успехе возвращает ok с созданными целями", done => {
    setup();
    const created: Goal[] = [];
    repo.createGoal.and.returnValue(of(created));

    useCase.execute(1, []).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(created);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'create_project_goals_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.createGoal.and.returnValue(throwError(() => err));

    useCase.execute(1, []).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("create_project_goals_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
