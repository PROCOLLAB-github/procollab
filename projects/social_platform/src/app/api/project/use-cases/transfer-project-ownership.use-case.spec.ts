/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { TransferProjectOwnershipUseCase } from "./transfer-project-ownership.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";

describe("TransferProjectOwnershipUseCase", () => {
  let useCase: TransferProjectOwnershipUseCase;
  let repo: any;

  function setup(): void {
    repo = { patchSwitchLeader: vi.fn() };
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
    repo.patchSwitchLeader.mockReturnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.patchSwitchLeader).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("при успехе возвращает ok с userId", () =>
    new Promise<void>(done => {
      setup();
      repo.patchSwitchLeader.mockReturnValue(of(undefined));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(42);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'transfer_project_ownership_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.patchSwitchLeader.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("transfer_project_ownership_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
