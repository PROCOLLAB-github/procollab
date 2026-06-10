/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectGoalsRepository } from "./project-goals.repository";
import { ProjectGoalsHttpAdapter } from "../../adapters/project/project-goals-http.adapter";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@domain/project/goal-form-data.model";

describe("ProjectGoalsRepository", () => {
  let repository: ProjectGoalsRepository;
  let adapter: any;

  function setup(): void {
    adapter = { getGoals: vi.fn(), addGoals: vi.fn(), editGoal: vi.fn(), deleteGoals: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectGoalsRepository, { provide: ProjectGoalsHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(ProjectGoalsRepository);
  }

  it("fetchAll делегирует в adapter и мапит ответ в Goal[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.getGoals.mockReturnValue(of([{ id: 1 }] as Goal[]));

      repository.fetchAll(42).subscribe(goals => {
        expect(adapter.getGoals).toHaveBeenCalledExactlyOnceWith(42);
        expect(goals[0]).toBeInstanceOf(Goal);
        done();
      });
    }));

  it("createGoal делегирует в adapter и мапит ответ в Goal[]", () =>
    new Promise<void>(done => {
      setup();
      const params: GoalFormData[] = [];
      adapter.addGoals.mockReturnValue(of([{ id: 1 }] as Goal[]));

      repository.createGoal(42, params).subscribe(goals => {
        expect(adapter.addGoals).toHaveBeenCalledExactlyOnceWith(42, params);
        expect(goals[0]).toBeInstanceOf(Goal);
        done();
      });
    }));

  it("editGoal делегирует в adapter и мапит ответ в Goal", () =>
    new Promise<void>(done => {
      setup();
      const params = {} as GoalFormData;
      adapter.editGoal.mockReturnValue(of({ id: 1 } as Goal));

      repository.editGoal(42, 7, params).subscribe(goal => {
        expect(adapter.editGoal).toHaveBeenCalledExactlyOnceWith(42, 7, params);
        expect(goal).toBeInstanceOf(Goal);
        done();
      });
    }));

  it("deleteGoal делегирует в adapter", () => {
    setup();
    adapter.deleteGoals.mockReturnValue(of(undefined));
    repository.deleteGoal(42, 7).subscribe();
    expect(adapter.deleteGoals).toHaveBeenCalledExactlyOnceWith(42, 7);
  });
});
