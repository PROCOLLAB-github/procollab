/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectCollaboratorsHttpAdapter } from "./project-collaborators-http.adapter";

describe("ProjectCollaboratorsHttpAdapter", () => {
  let adapter: ProjectCollaboratorsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { patch: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectCollaboratorsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectCollaboratorsHttpAdapter);
  }

  it("deleteCollaborator идёт в DELETE /projects/:pid/collaborators?id=:uid", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteCollaborator(42, 7).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/projects/42/collaborators?id=7/");
  });

  it("patchSwitchLeader идёт в PATCH /projects/:pid/collaborators/:uid/switch-leader/", () => {
    setup();
    api.patch.mockReturnValue(of(undefined));

    adapter.patchSwitchLeader(42, 7).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith(
      "/projects/42/collaborators/7/switch-leader/",
      {},
    );
  });

  it("deleteLeave идёт в DELETE /projects/:pid/collaborators/leave", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteLeave(42).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/projects/42/collaborators/leave/");
  });
});
