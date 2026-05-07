/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectGoalsRepository } from "./project-goals.repository";
import { ProjectGoalsHttpAdapter } from "../../adapters/project/project-goals-http.adapter";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "../../adapters/project/dto/project-goal.dto";

describe("ProjectGoalsRepository", () => {
  let repository: ProjectGoalsRepository;
  let adapter: jasmine.SpyObj<ProjectGoalsHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectGoalsHttpAdapter>("ProjectGoalsHttpAdapter", [
      "getGoals",
      "addGoals",
      "editGoal",
      "deleteGoals",
    ]);
    TestBed.configureTestingModule({
      providers: [ProjectGoalsRepository, { provide: ProjectGoalsHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(ProjectGoalsRepository);
  }

  it("fetchAll делегирует в adapter и мапит ответ в Goal[]", done => {
    setup();
    adapter.getGoals.and.returnValue(of([{ id: 1 }] as Goal[]));

    repository.fetchAll(42).subscribe(goals => {
      expect(adapter.getGoals).toHaveBeenCalledOnceWith(42);
      expect(goals[0]).toBeInstanceOf(Goal);
      done();
    });
  });

  it("createGoal делегирует в adapter и мапит ответ в Goal[]", done => {
    setup();
    const params: GoalFormData[] = [];
    adapter.addGoals.and.returnValue(of([{ id: 1 }] as Goal[]));

    repository.createGoal(42, params).subscribe(goals => {
      expect(adapter.addGoals).toHaveBeenCalledOnceWith(42, params);
      expect(goals[0]).toBeInstanceOf(Goal);
      done();
    });
  });

  it("editGoal делегирует в adapter и мапит ответ в Goal", done => {
    setup();
    const params = {} as GoalFormData;
    adapter.editGoal.and.returnValue(of({ id: 1 } as Goal));

    repository.editGoal(42, 7, params).subscribe(goal => {
      expect(adapter.editGoal).toHaveBeenCalledOnceWith(42, 7, params);
      expect(goal).toBeInstanceOf(Goal);
      done();
    });
  });

  it("deleteGoal делегирует в adapter", () => {
    setup();
    adapter.deleteGoals.and.returnValue(of(undefined));
    repository.deleteGoal(42, 7).subscribe();
    expect(adapter.deleteGoals).toHaveBeenCalledOnceWith(42, 7);
  });
});
