/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RevokeInviteUseCase } from "./revoke-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Invite } from "@domain/invite/invite.model";

describe("RevokeInviteUseCase", () => {
  let useCase: RevokeInviteUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["revokeInvite"]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        RevokeInviteUseCase,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(RevokeInviteUseCase);
  }

  const fakeInvite: Invite = {
    id: 1,
    project: { id: 10 },
    user: { id: 20 },
  } as unknown as Invite;

  it("делегирует invitationId в репозиторий и эмитит событие", () => {
    setup();
    repo.revokeInvite.and.returnValue(of(fakeInvite));

    useCase.execute(1).subscribe();

    expect(repo.revokeInvite).toHaveBeenCalledOnceWith(1);
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.revokeInvite.and.returnValue(of(fakeInvite));

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
      expect(eventBus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
