/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { InviteRepository } from "./invite.repository";
import { InviteHttpAdapter } from "../../adapters/invite/invite-http.adapter";
import { EventBus } from "@domain/shared/event-bus";
import { Invite } from "@domain/invite/invite.model";
import { acceptInvite } from "@domain/invite/events/accept-invite.event";
import { rejectInvite } from "@domain/invite/events/reject-invite.event";

describe("InviteRepository", () => {
  let repository: InviteRepository;
  let adapter: any;
  let eventBus: EventBus;

  function setup(): void {
    adapter = {
      sendForUser: vi.fn(),
      revokeInvite: vi.fn(),
      acceptInvite: vi.fn(),
      rejectInvite: vi.fn(),
      updateInvite: vi.fn(),
      getMy: vi.fn(),
      getByProject: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [InviteRepository, { provide: InviteHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    repository = TestBed.inject(InviteRepository);
  }

  it("sendForUser делегирует в adapter и мапит ответ в Invite", () =>
    new Promise<void>(done => {
      setup();
      adapter.sendForUser.mockReturnValue(of({ id: 1 } as Invite));

      repository.sendForUser(10, 42, "dev", "frontend").subscribe(invite => {
        expect(adapter.sendForUser).toHaveBeenCalledExactlyOnceWith(10, 42, "dev", "frontend");
        expect(invite).toBeInstanceOf(Invite);
        done();
      });
    }));

  it("revokeInvite делегирует в adapter", () => {
    setup();
    adapter.revokeInvite.mockReturnValue(of(undefined));

    repository.revokeInvite(7).subscribe();

    expect(adapter.revokeInvite).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("acceptInvite делегирует в adapter", () => {
    setup();
    adapter.acceptInvite.mockReturnValue(of({ id: 5 } as Invite));
    repository.acceptInvite(5).subscribe();
    expect(adapter.acceptInvite).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("rejectInvite делегирует в adapter", () => {
    setup();
    adapter.rejectInvite.mockReturnValue(of({ id: 5 } as Invite));
    repository.rejectInvite(5).subscribe();
    expect(adapter.rejectInvite).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("updateInvite делегирует в adapter", () => {
    setup();
    adapter.updateInvite.mockReturnValue(of({ id: 5 } as Invite));
    repository.updateInvite(5, "dev", "backend").subscribe();
    expect(adapter.updateInvite).toHaveBeenCalledExactlyOnceWith(5, "dev", "backend");
  });

  it("getMy делегирует в adapter", () => {
    setup();
    adapter.getMy.mockReturnValue(of([] as Invite[]));
    repository.getMy().subscribe();
    expect(adapter.getMy).toHaveBeenCalledExactlyOnceWith();
  });

  it("getByProject делегирует в adapter", () => {
    setup();
    adapter.getByProject.mockReturnValue(of([] as Invite[]));
    repository.getByProject(42).subscribe();
    expect(adapter.getByProject).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("на событие AcceptInvite уменьшает myInvitesCount$", () =>
    new Promise<void>(done => {
      setup();
      repository.myInvitesCount$.next(3);

      eventBus.emit(acceptInvite(1, 42, 10, "dev"));

      expect(repository.myInvitesCount$.getValue()).toBe(2);
      done();
    }));

  it("на событие RejectInvite уменьшает myInvitesCount$ (не ниже нуля)", () => {
    setup();
    repository.myInvitesCount$.next(0);

    eventBus.emit(rejectInvite(1, 42, 10));

    expect(repository.myInvitesCount$.getValue()).toBe(0);
  });
});
