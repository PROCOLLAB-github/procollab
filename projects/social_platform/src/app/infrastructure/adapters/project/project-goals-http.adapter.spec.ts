/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectGoalsHttpAdapter } from "./project-goals-http.adapter";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@domain/project/goal-form-data.model";

describe("ProjectGoalsHttpAdapter", () => {
  let adapter: ProjectGoalsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectGoalsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectGoalsHttpAdapter);
  }

  it("getGoals идёт в GET /projects/:id/goals/", () => {
    setup();
    api.get.mockReturnValue(of([] as Goal[]));

    adapter.getGoals(42).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/42/goals/");
  });

  it("addGoals идёт в POST /projects/:id/goals/ c массивом", () => {
    setup();
    api.post.mockReturnValue(of([] as Goal[]));
    const data = [] as GoalFormData[];

    adapter.addGoals(42, data).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/goals/", data);
  });

  it("editGoal идёт в PUT /projects/:pid/goals/:gid c params", () => {
    setup();
    api.put.mockReturnValue(of({} as Goal));
    const params = {} as GoalFormData;

    adapter.editGoal(42, 9, params).subscribe();

    expect(api.put).toHaveBeenCalledExactlyOnceWith("/projects/42/goals/9/", params);
  });

  it("deleteGoals идёт в DELETE /projects/:pid/goals/:gid", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteGoals(42, 9).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/projects/42/goals/9/");
  });
});
