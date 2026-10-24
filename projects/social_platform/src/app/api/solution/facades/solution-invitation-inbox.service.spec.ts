/** @format */

import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { fail, ok } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  SolutionInvitation,
  SolutionInvitationActionResult,
  SolutionInvitationCreated,
} from "@domain/solution/solution-contract.model";
import {
  DecideSolutionInvitationUseCase,
  GetMySolutionInvitationsUseCase,
} from "../use-cases/solution-team.use-cases";
import { SolutionInvitationInboxService } from "./solution-invitation-inbox.service";

const source = (
  solutionContractScenarios.find(s => s.name === "create_invitation")!
    .response as SolutionInvitationCreated
).invitation;
const invitation: SolutionInvitation = {
  ...source,
  permissions: { canEdit: false, canRevoke: false, canAccept: true, canDecline: true },
};
const page = { count: 1, next: null, previous: null, results: [invitation] };

describe("Входящие приглашения решений", () => {
  const get = { execute: vi.fn() },
    decide = { execute: vi.fn() };
  let inbox: SolutionInvitationInboxService;
  beforeEach(() => {
    vi.useFakeTimers();
    get.execute.mockReset().mockReturnValue(of(ok(page)));
    decide.execute.mockReset();
    TestBed.configureTestingModule({
      providers: [
        SolutionInvitationInboxService,
        { provide: GetMySolutionInvitationsUseCase, useValue: get },
        { provide: DecideSolutionInvitationUseCase, useValue: decide },
      ],
    });
    inbox = TestBed.inject(SolutionInvitationInboxService);
  });
  afterEach(() => {
    inbox.bindUser(null);
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("deduplicates desktop/mobile binding and polls only while a user is bound", async () => {
    inbox.bindUser(invitation.recipient.id);
    inbox.bindUser(invitation.recipient.id);
    await vi.advanceTimersByTimeAsync(0);
    expect(get.execute).toHaveBeenCalledTimes(1);
    expect(inbox.count()).toBe(1);
    await vi.advanceTimersByTimeAsync(30000);
    expect(get.execute).toHaveBeenCalledTimes(2);
    inbox.bindUser(null);
    expect(inbox.items()).toEqual([]);
    await vi.advanceTimersByTimeAsync(30000);
    expect(get.execute).toHaveBeenCalledTimes(2);
  });

  it("user change cancels old reads and cannot show another user's invitation", async () => {
    const old = new Subject<ReturnType<typeof ok<typeof page>>>();
    get.execute
      .mockReturnValueOnce(old)
      .mockReturnValue(
        of(
          ok({
            count: 1,
            next: null,
            previous: null,
            results: [{ ...invitation, id: 702, recipient: { ...invitation.recipient, id: 21 } }],
          }),
        ),
      );
    inbox.bindUser(invitation.recipient.id);
    await vi.advanceTimersByTimeAsync(0);
    inbox.bindUser(21);
    await vi.advanceTimersByTimeAsync(0);
    old.next(ok(page));
    expect(inbox.items().map(row => [row.id, row.recipient.id])).toEqual([[702, 21]]);
  });

  it("accept remains pending until server success and then synchronizes without optimistic membership", async () => {
    inbox.bindUser(invitation.recipient.id);
    await vi.advanceTimersByTimeAsync(0);
    const pending = new Subject<ReturnType<typeof ok<SolutionInvitationActionResult>>>();
    decide.execute.mockReturnValue(pending);
    const received = vi.fn();
    inbox.action(invitation, "accept").subscribe(received);
    expect(inbox.items()).toHaveLength(1);
    expect(received).not.toHaveBeenCalled();
    expect(inbox.pendingId()).toBe(invitation.id);
    inbox.action(invitation, "accept").subscribe();
    expect(decide.execute).toHaveBeenCalledTimes(1);
    get.execute.mockReturnValue(of(ok({ count: 0, next: null, previous: null, results: [] })));
    pending.next(
      ok({
        invitation: { ...invitation, status: "accepted", version: 2 },
        application: invitation.solution,
        solutionVersion: 3,
      }),
    );
    pending.complete();
    expect(inbox.items()).toEqual([]);
    expect(inbox.pendingId()).toBeNull();
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it("error keeps the invitation and its reason after a successful background refresh", async () => {
    inbox.bindUser(invitation.recipient.id);
    await vi.advanceTimersByTimeAsync(0);
    decide.execute.mockReturnValue(
      of(
        fail({
          code: "already_in_program_team",
          detail: "Вы уже состоите в другой команде.",
          errors: [],
          meta: {},
        }),
      ),
    );
    const received = vi.fn();
    inbox.action(invitation, "accept").subscribe(received);
    expect(inbox.items()).toHaveLength(1);
    expect(inbox.error()).toBe("Вы уже состоите в другой команде.");
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    inbox.refresh();
    expect(inbox.error()).toBe("");
  });
});
