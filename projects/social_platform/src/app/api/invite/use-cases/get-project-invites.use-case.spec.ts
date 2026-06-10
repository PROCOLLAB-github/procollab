/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectInvitesUseCase } from "./get-project-invites.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";

describe("GetProjectInvitesUseCase", () => {
  let useCase: GetProjectInvitesUseCase;
  let repo: any;

  function setup(): void {
    repo = { getByProject: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProjectInvitesUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectInvitesUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.getByProject.mockReturnValue(of([]));

    useCase.execute(42).subscribe();

    expect(repo.getByProject).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("при успехе возвращает ok со списком приглашений", () =>
    new Promise<void>(done => {
      setup();
      const invites = [{ id: 1 }] as unknown as Invite[];
      repo.getByProject.mockReturnValue(of(invites));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(invites);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_invites_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getByProject.mockReturnValue(throwError(() => boom));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_invites_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
