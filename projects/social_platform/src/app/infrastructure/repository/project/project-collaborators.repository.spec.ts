/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectCollaboratorsRepository } from "./project-collaborators.repository";
import { ProjectCollaboratorsHttpAdapter } from "../../adapters/project/project-collaborators-http.adapter";

describe("ProjectCollaboratorsRepository", () => {
  let repository: ProjectCollaboratorsRepository;
  let adapter: jasmine.SpyObj<ProjectCollaboratorsHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectCollaboratorsHttpAdapter>(
      "ProjectCollaboratorsHttpAdapter",
      ["deleteCollaborator", "patchSwitchLeader", "deleteLeave"]
    );
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
    adapter.deleteCollaborator.and.returnValue(of(undefined));
    repository.deleteCollaborator(1, 42).subscribe();
    expect(adapter.deleteCollaborator).toHaveBeenCalledOnceWith(1, 42);
  });

  it("patchSwitchLeader делегирует в adapter", () => {
    setup();
    adapter.patchSwitchLeader.and.returnValue(of(undefined));
    repository.patchSwitchLeader(1, 42).subscribe();
    expect(adapter.patchSwitchLeader).toHaveBeenCalledOnceWith(1, 42);
  });

  it("deleteLeave делегирует в adapter", () => {
    setup();
    adapter.deleteLeave.and.returnValue(of(undefined));
    repository.deleteLeave(1).subscribe();
    expect(adapter.deleteLeave).toHaveBeenCalledOnceWith(1);
  });
});
