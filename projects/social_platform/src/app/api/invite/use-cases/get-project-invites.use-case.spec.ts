/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectInvitesUseCase } from "./get-project-invites.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";

describe("GetProjectInvitesUseCase", () => {
  let useCase: GetProjectInvitesUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["getByProject"]);
    TestBed.configureTestingModule({
      providers: [GetProjectInvitesUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectInvitesUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.getByProject.and.returnValue(of([]));

    useCase.execute(42).subscribe();

    expect(repo.getByProject).toHaveBeenCalledOnceWith(42);
  });

  it("при успехе возвращает ok со списком приглашений", done => {
    setup();
    const invites = [{ id: 1 }] as unknown as Invite[];
    repo.getByProject.and.returnValue(of(invites));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(invites);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_invites_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getByProject.and.returnValue(throwError(() => boom));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_invites_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
