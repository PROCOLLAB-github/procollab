/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RevokeInviteUseCase } from "./revoke-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";

describe("RevokeInviteUseCase", () => {
  let useCase: RevokeInviteUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["revokeInvite"]);
    TestBed.configureTestingModule({
      providers: [RevokeInviteUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(RevokeInviteUseCase);
  }

  it("делегирует invitationId в репозиторий", () => {
    setup();
    repo.revokeInvite.and.returnValue(of(undefined));

    useCase.execute(1).subscribe();

    expect(repo.revokeInvite).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.revokeInvite.and.returnValue(of(undefined));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'revoke_invite_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.revokeInvite.and.returnValue(throwError(() => boom));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("revoke_invite_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
