/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { TransferProjectOwnershipUseCase } from "./transfer-project-ownership.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";

describe("TransferProjectOwnershipUseCase", () => {
  let useCase: TransferProjectOwnershipUseCase;
  let repo: jasmine.SpyObj<ProjectCollaboratorsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectCollaboratorsRepositoryPort>(
      "ProjectCollaboratorsRepositoryPort",
      ["patchSwitchLeader"]
    );
    TestBed.configureTestingModule({
      providers: [
        TransferProjectOwnershipUseCase,
        { provide: ProjectCollaboratorsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(TransferProjectOwnershipUseCase);
  }

  it("делегирует (projectId, userId) в patchSwitchLeader", () => {
    setup();
    repo.patchSwitchLeader.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.patchSwitchLeader).toHaveBeenCalledOnceWith(1, 42);
  });

  it("при успехе возвращает ok с userId", done => {
    setup();
    repo.patchSwitchLeader.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'transfer_project_ownership_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.patchSwitchLeader.and.returnValue(throwError(() => err));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("transfer_project_ownership_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
