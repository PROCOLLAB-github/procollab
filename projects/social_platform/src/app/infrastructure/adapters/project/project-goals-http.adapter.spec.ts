/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectGoalsHttpAdapter } from "./project-goals-http.adapter";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "./dto/project-goal.dto";

describe("ProjectGoalsHttpAdapter", () => {
  let adapter: ProjectGoalsHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "put", "delete"]);
    TestBed.configureTestingModule({
      providers: [ProjectGoalsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectGoalsHttpAdapter);
  }

  it("getGoals идёт в GET /projects/:id/goals/", () => {
    setup();
    api.get.and.returnValue(of([] as Goal[]));

    adapter.getGoals(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/goals/");
  });

  it("addGoals идёт в POST /projects/:id/goals/ c массивом", () => {
    setup();
    api.post.and.returnValue(of([] as Goal[]));
    const data = [] as GoalFormData[];

    adapter.addGoals(42, data).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/goals/", data);
  });

  it("editGoal идёт в PUT /projects/:pid/goals/:gid c params", () => {
    setup();
    api.put.and.returnValue(of({} as Goal));
    const params = {} as GoalFormData;

    adapter.editGoal(42, 9, params).subscribe();

    expect(api.put).toHaveBeenCalledOnceWith("/projects/42/goals/9", params);
  });

  it("deleteGoals идёт в DELETE /projects/:pid/goals/:gid", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.deleteGoals(42, 9).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/projects/42/goals/9");
  });
});
