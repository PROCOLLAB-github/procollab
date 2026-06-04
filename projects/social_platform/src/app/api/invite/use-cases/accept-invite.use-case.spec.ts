/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AcceptInviteUseCase } from "./accept-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Invite } from "@domain/invite/invite.model";

describe("AcceptInviteUseCase", () => {
  let useCase: AcceptInviteUseCase;
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { acceptInvite: vi.fn() };
    eventBus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AcceptInviteUseCase,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(AcceptInviteUseCase);
  }

  const fakeInvite: Invite = {
    id: 1,
    project: { id: 10 },
    user: { id: 20 },
    role: "member",
  } as unknown as Invite;

  it("делегирует inviteId в репозиторий и эмитит событие", () => {
    setup();
    repo.acceptInvite.mockReturnValue(of(fakeInvite));

    useCase.execute(1).subscribe();

    expect(repo.acceptInvite).toHaveBeenCalledExactlyOnceWith(1);
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.acceptInvite.mockReturnValue(of(fakeInvite));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.acceptInvite.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        expect(eventBus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
