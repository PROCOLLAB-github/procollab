/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RejectInviteUseCase } from "./reject-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Invite } from "@domain/invite/invite.model";

describe("RejectInviteUseCase", () => {
  let useCase: RejectInviteUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["rejectInvite"]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        RejectInviteUseCase,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(RejectInviteUseCase);
  }

  const fakeInvite: Invite = {
    id: 1,
    project: { id: 10 },
    user: { id: 20 },
  } as unknown as Invite;

  it("делегирует inviteId в репозиторий и эмитит событие", () => {
    setup();
    repo.rejectInvite.and.returnValue(of(fakeInvite));

    useCase.execute(1).subscribe();

    expect(repo.rejectInvite).toHaveBeenCalledOnceWith(1);
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.rejectInvite.and.returnValue(of(fakeInvite));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.rejectInvite.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      expect(eventBus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
