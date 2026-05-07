/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateInviteUseCase } from "./update-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";

describe("UpdateInviteUseCase", () => {
  let useCase: UpdateInviteUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["updateInvite"]);
    TestBed.configureTestingModule({
      providers: [UpdateInviteUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(UpdateInviteUseCase);
  }

  it("делегирует параметры команды в репозиторий", () => {
    setup();
    repo.updateInvite.and.returnValue(of({} as Invite));

    useCase.execute({ inviteId: 1, role: "lead", specialization: "BE" }).subscribe();

    expect(repo.updateInvite).toHaveBeenCalledOnceWith(1, "lead", "BE");
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.updateInvite.and.returnValue(of({} as Invite));

    useCase.execute({ inviteId: 1, role: "lead" }).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'update_invite_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.updateInvite.and.returnValue(throwError(() => boom));

    useCase.execute({ inviteId: 1, role: "lead" }).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("update_invite_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
