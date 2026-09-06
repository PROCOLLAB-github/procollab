/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectProgramHttpAdapter } from "./project-program-http.adapter";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";

describe("ProjectProgramHttpAdapter", () => {
  let adapter: ProjectProgramHttpAdapter;
  let api: any;

  function setup(): void {
    api = { post: vi.fn(), put: vi.fn(), get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectProgramHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectProgramHttpAdapter);
  }

  it("assignProjectToProgram идёт в POST /projects/assign-to-program/ c projectId/partnerProgramId", () => {
    setup();
    api.post.mockReturnValue(of({} as ProjectAssign));

    adapter.assignProjectToProgram(42, 5).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/assign-to-program/", {
      projectId: 42,
      partnerProgramId: 5,
    });
  });

  it("GET uses canonical link 700, not project 55", () => {
    setup();
    api.get.mockReturnValue(of(programLinkFields()));
    adapter.getProgramLinkFields(700).subscribe();
    expect(api.get).toHaveBeenCalledExactlyOnceWith(
      "/programs/partner-program-projects/700/fields/",
    );
  });

  it("PUT uses canonical link 700 and field_id/value_text", () => {
    setup();
    api.put.mockReturnValue(of({ detail: "Значения успешно обновлены" }));
    const values = [{ fieldId: 5, valueText: "Цифровой HR" }];

    adapter
      .updateProgramLinkFields(700, values)
      .subscribe(result => expect(result).toBeUndefined());

    expect(api.put).toHaveBeenCalledExactlyOnceWith(
      "/programs/partner-program-projects/700/fields/",
      [{ field_id: 5, value_text: "Цифровой HR" }],
    );
  });
});
