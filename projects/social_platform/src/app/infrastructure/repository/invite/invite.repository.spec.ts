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
  let adapter: jasmine.SpyObj<InviteHttpAdapter>;
  let eventBus: EventBus;

  function setup(): void {
    adapter = jasmine.createSpyObj<InviteHttpAdapter>("InviteHttpAdapter", [
      "sendForUser",
      "revokeInvite",
      "acceptInvite",
      "rejectInvite",
      "updateInvite",
      "getMy",
      "getByProject",
    ]);
    TestBed.configureTestingModule({
      providers: [InviteRepository, { provide: InviteHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    repository = TestBed.inject(InviteRepository);
  }

  it("sendForUser делегирует в adapter и мапит ответ в Invite", done => {
    setup();
    adapter.sendForUser.and.returnValue(of({ id: 1 } as Invite));

    repository.sendForUser(10, 42, "dev", "frontend").subscribe(invite => {
      expect(adapter.sendForUser).toHaveBeenCalledOnceWith(10, 42, "dev", "frontend");
      expect(invite).toBeInstanceOf(Invite);
      done();
    });
  });

  it("revokeInvite делегирует в adapter", () => {
    setup();
    adapter.revokeInvite.and.returnValue(of(undefined));

    repository.revokeInvite(7).subscribe();

    expect(adapter.revokeInvite).toHaveBeenCalledOnceWith(7);
  });

  it("acceptInvite делегирует в adapter", () => {
    setup();
    adapter.acceptInvite.and.returnValue(of({ id: 5 } as Invite));
    repository.acceptInvite(5).subscribe();
    expect(adapter.acceptInvite).toHaveBeenCalledOnceWith(5);
  });

  it("rejectInvite делегирует в adapter", () => {
    setup();
    adapter.rejectInvite.and.returnValue(of({ id: 5 } as Invite));
    repository.rejectInvite(5).subscribe();
    expect(adapter.rejectInvite).toHaveBeenCalledOnceWith(5);
  });

  it("updateInvite делегирует в adapter", () => {
    setup();
    adapter.updateInvite.and.returnValue(of({ id: 5 } as Invite));
    repository.updateInvite(5, "dev", "backend").subscribe();
    expect(adapter.updateInvite).toHaveBeenCalledOnceWith(5, "dev", "backend");
  });

  it("getMy делегирует в adapter", () => {
    setup();
    adapter.getMy.and.returnValue(of([] as Invite[]));
    repository.getMy().subscribe();
    expect(adapter.getMy).toHaveBeenCalledOnceWith();
  });

  it("getByProject делегирует в adapter", () => {
    setup();
    adapter.getByProject.and.returnValue(of([] as Invite[]));
    repository.getByProject(42).subscribe();
    expect(adapter.getByProject).toHaveBeenCalledOnceWith(42);
  });

  it("на событие AcceptInvite уменьшает myInvitesCount$", done => {
    setup();
    repository.myInvitesCount$.next(3);

    eventBus.emit(acceptInvite(1, 42, 10, "dev"));

    expect(repository.myInvitesCount$.getValue()).toBe(2);
    done();
  });

  it("на событие RejectInvite уменьшает myInvitesCount$ (не ниже нуля)", () => {
    setup();
    repository.myInvitesCount$.next(0);

    eventBus.emit(rejectInvite(1, 42, 10));

    expect(repository.myInvitesCount$.getValue()).toBe(0);
  });
});
