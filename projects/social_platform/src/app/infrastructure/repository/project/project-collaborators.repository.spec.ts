/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectCollaboratorsRepository } from "./project-collaborators.repository";
import { ProjectCollaboratorsHttpAdapter } from "../../adapters/project/project-collaborators-http.adapter";

describe("ProjectCollaboratorsRepository", () => {
  let repository: ProjectCollaboratorsRepository;
  let adapter: any;

  function setup(): void {
    adapter = { deleteCollaborator: vi.fn(), patchSwitchLeader: vi.fn(), deleteLeave: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ProjectCollaboratorsRepository,
        { provide: ProjectCollaboratorsHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectCollaboratorsRepository);
  }

  it("deleteCollaborator делегирует в adapter", () => {
    setup();
    adapter.deleteCollaborator.mockReturnValue(of(undefined));
    repository.deleteCollaborator(1, 42).subscribe();
    expect(adapter.deleteCollaborator).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("patchSwitchLeader делегирует в adapter", () => {
    setup();
    adapter.patchSwitchLeader.mockReturnValue(of(undefined));
    repository.patchSwitchLeader(1, 42).subscribe();
    expect(adapter.patchSwitchLeader).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("deleteLeave делегирует в adapter", () => {
    setup();
    adapter.deleteLeave.mockReturnValue(of(undefined));
    repository.deleteLeave(1).subscribe();
    expect(adapter.deleteLeave).toHaveBeenCalledExactlyOnceWith(1);
  });
});
