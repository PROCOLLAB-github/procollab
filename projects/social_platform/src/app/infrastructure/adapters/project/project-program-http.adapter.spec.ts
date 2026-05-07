/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectProgramHttpAdapter } from "./project-program-http.adapter";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { ProjectDto } from "./dto/project.dto";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";

describe("ProjectProgramHttpAdapter", () => {
  let adapter: ProjectProgramHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["post", "put"]);
    TestBed.configureTestingModule({
      providers: [ProjectProgramHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectProgramHttpAdapter);
  }

  it("assignProjectToProgram идёт в POST /projects/assign-to-program/ c projectId/partnerProgramId", () => {
    setup();
    api.post.and.returnValue(of({} as ProjectAssign));

    adapter.assignProjectToProgram(42, 5).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/assign-to-program/", {
      projectId: 42,
      partnerProgramId: 5,
    });
  });

  it("sendNewProjectFieldsValues идёт в PUT /projects/:id/program-fields/ c массивом", () => {
    setup();
    api.put.and.returnValue(of({} as ProjectDto));
    const values = [] as ProjectNewAdditionalProgramFields[];

    adapter.sendNewProjectFieldsValues(42, values).subscribe();

    expect(api.put).toHaveBeenCalledOnceWith("/projects/42/program-fields/", values);
  });
});
