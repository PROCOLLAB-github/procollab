/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import {
  GetSolutionInvitationsUseCase,
  LeaveSolutionUseCase,
  RemoveSolutionMemberUseCase,
  RevokeSolutionInvitationUseCase,
  TransferSolutionCaptainUseCase,
  UpdateSolutionInvitationUseCase,
} from "@api/solution/use-cases/solution-team.use-cases";
import {
  ProgramSolution,
  SolutionInvitation,
  SolutionInvitationCreated,
  SolutionMutationReceipt,
} from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { SolutionTeamComponent } from "./solution-team.component";

const base = solutionContractScenarios.find(s => s.name === "created_solo")!
  .response as ProgramSolution;
const invited = (
  solutionContractScenarios.find(s => s.name === "create_invitation")!
    .response as SolutionInvitationCreated
).invitation;
const member = {
  user: { id: 9, firstName: "Анна", lastName: "Смирнова", avatarUrl: null },
  role: "Аналитик",
  specialization: null,
  joinedAt: "2026-10-24T10:00:00Z",
  isCaptain: false,
};
const receipt = {
  solutionId: base.id,
  solutionVersion: 2,
  updatedAt: "2026-10-24T10:00:00Z",
} satisfies SolutionMutationReceipt;

describe("Команда внутри заявки", () => {
  const profile = signal({ id: base.captainId });
  const list = { execute: vi.fn() },
    remove = { execute: vi.fn() },
    leave = { execute: vi.fn() },
    transfer = { execute: vi.fn() },
    update = { execute: vi.fn() },
    revoke = { execute: vi.fn() };
  const pending: SolutionInvitation = {
    ...invited,
    recipient: { ...invited.recipient, id: 21 },
    permissions: { canEdit: true, canRevoke: true, canAccept: false, canDecline: false },
  };
  beforeEach(() => {
    profile.set({ id: base.captainId });
    list.execute
      .mockReset()
      .mockReturnValue(of(ok({ count: 1, next: null, previous: null, results: [pending] })));
    for (const command of [remove, transfer, update, revoke])
      command.execute.mockReset().mockReturnValue(of(ok(receipt)));
    leave.execute.mockReset().mockReturnValue(of(ok(undefined)));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [SolutionTeamComponent],
      providers: [
        { provide: ProfileInfoService, useValue: { profile } },
        { provide: GetSolutionInvitationsUseCase, useValue: list },
        { provide: RemoveSolutionMemberUseCase, useValue: remove },
        { provide: LeaveSolutionUseCase, useValue: leave },
        { provide: TransferSolutionCaptainUseCase, useValue: transfer },
        { provide: UpdateSolutionInvitationUseCase, useValue: update },
        { provide: RevokeSolutionInvitationUseCase, useValue: revoke },
      ],
    });
  });
  afterEach(() => vi.restoreAllMocks());
  async function setup(changes: Partial<ProgramSolution> = {}) {
    const fixture = TestBed.createComponent(SolutionTeamComponent);
    fixture.componentRef.setInput("solution", {
      ...structuredClone(base),
      team: {
        ...base.team,
        members: [...base.team.members, member],
        acceptedCount: 2,
        pendingCount: 1,
        reservedCount: 3,
      },
      ...changes,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it("renders accepted and pending rows and uses the program-scoped list", async () => {
    const fixture = await setup();
    expect(fixture.nativeElement.textContent).toContain("Участники команды · 2");
    expect(fixture.nativeElement.textContent).toContain("Ожидают подтверждения · 1");
    expect(fixture.nativeElement.textContent).toContain("Аналитик");
    expect(list.execute).toHaveBeenCalledWith(base.programId, base.id, {
      status: "pending",
      limit: 100,
      offset: 0,
    });
  });

  it("remove confirms, sends exact versions, blocks double action and refreshes after receipt", async () => {
    const pendingRequest = new Subject<ReturnType<typeof ok<SolutionMutationReceipt>>>();
    remove.execute.mockReturnValue(pendingRequest);
    const fixture = await setup();
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.remove(member);
    component.remove(member);
    expect(remove.execute).toHaveBeenCalledTimes(1);
    expect(remove.execute).toHaveBeenCalledWith(base.programId, base.id, 9, base.version);
    expect(component.busy()).toBe(true);
    pendingRequest.next(ok(receipt));
    pendingRequest.complete();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(component.busy()).toBe(false);
  });

  it("transfer updates permissions from the refreshed server object", async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.transfer(member);
    expect(transfer.execute).toHaveBeenCalledWith(base.programId, base.id, {
      expectedSolutionVersion: base.version,
      newCaptainUserId: 9,
    });
    const current = component.solution();
    fixture.componentRef.setInput("solution", {
      ...current,
      version: 2,
      captainId: 9,
      permissions: {
        ...current.permissions,
        canManageTeam: false,
        canInvite: false,
        canLeave: true,
      },
      team: {
        ...current.team,
        members: current.team.members.map(row => ({ ...row, isCaptain: row.user.id === 9 })),
      },
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Выйти из команды");
    expect(
      fixture.nativeElement.querySelector('[aria-label="Исключить участника: Анна Смирнова"]'),
    ).toBeNull();
    expect(component.pending()).toEqual([]);
  });

  it("regular member sees no private pending identities and can leave only with server permission", async () => {
    profile.set({ id: 9 });
    const fixture = await setup({
      permissions: { ...base.permissions, canManageTeam: false, canInvite: false, canLeave: true },
    });
    const component = fixture.componentInstance;
    const left = vi.fn();
    component.left.subscribe(left);
    expect(list.execute).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      "Список отправленных приглашений доступен капитану",
    );
    component.leave();
    expect(left).toHaveBeenCalledTimes(1);
    expect(leave.execute).toHaveBeenCalledWith(base.programId, base.id, {
      expectedSolutionVersion: base.version,
    });
  });

  it("submitted captain cannot edit accepted team or role, but can revoke pending", async () => {
    list.execute.mockReturnValue(
      of(
        ok({
          count: 1,
          next: null,
          previous: null,
          results: [{ ...pending, permissions: { ...pending.permissions, canEdit: false } }],
        }),
      ),
    );
    const fixture = await setup({
      permissions: { ...base.permissions, canManageTeam: false, canInvite: false, canLeave: false },
      team: { ...base.team, members: [...base.team.members, member], isFrozen: true },
    });
    const component = fixture.componentInstance;
    component.remove(member);
    component.transfer(member);
    component.leave();
    expect(remove.execute).not.toHaveBeenCalled();
    expect(transfer.execute).not.toHaveBeenCalled();
    expect(leave.execute).not.toHaveBeenCalled();
    component.revoke(component.pending()[0]);
    expect(revoke.execute).toHaveBeenCalledWith(pending.id, pending.version, base.version);
  });

  it("list error is not an empty list and blocks inviting until retry succeeds", async () => {
    list.execute.mockReturnValueOnce(
      of(
        fail({
          code: "network",
          detail: "Не удалось загрузить приглашения.",
          errors: [],
          meta: {},
        }),
      ),
    );
    const fixture = await setup();
    expect(fixture.nativeElement.textContent).toContain("Не удалось загрузить приглашения");
    expect(fixture.nativeElement.textContent).not.toContain("Нет ожидающих приглашений");
    fixture.componentInstance.reloadInvitations();
    await fixture.whenStable();
    expect(fixture.componentInstance.pending()).toHaveLength(1);
  });

  it("changing program cancels old invitation reads and cannot render their late result", async () => {
    const old = new Subject<
      ReturnType<
        typeof ok<{ count: number; next: null; previous: null; results: SolutionInvitation[] }>
      >
    >();
    list.execute
      .mockReturnValueOnce(old)
      .mockReturnValue(of(ok({ count: 0, next: null, previous: null, results: [] })));
    const fixture = await setup();
    fixture.componentRef.setInput("solution", {
      ...fixture.componentInstance.solution(),
      id: 999,
      programId: 13,
    });
    await fixture.whenStable();
    old.next(ok({ count: 1, next: null, previous: null, results: [pending] }));
    expect(fixture.componentInstance.pending()).toEqual([]);
    expect(list.execute).toHaveBeenLastCalledWith(13, 999, {
      status: "pending",
      limit: 100,
      offset: 0,
    });
  });
});
