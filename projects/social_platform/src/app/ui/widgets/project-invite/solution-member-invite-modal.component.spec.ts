/** @format */

import { provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { InviteParticipantSearchFacade } from "@api/invite/facades/invite-participant-search.facade";
import { CreateSolutionInvitationUseCase } from "@api/solution/use-cases/solution-team.use-cases";
import { User } from "@domain/auth/user.model";
import {
  ProgramSolution,
  SolutionApiError,
  SolutionInvitation,
  SolutionInvitationCreated,
} from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SolutionMemberInviteModalComponent } from "./solution-member-invite-modal.component";

const candidate = {
  id: 42,
  firstName: "Иван",
  lastName: "Тест",
  personal: { avatar: "", birthday: "2000-01-01", speciality: "Разработка" },
  relations: { skills: [] },
} as unknown as User;
const base = solutionContractScenarios.find(s => s.name === "created_solo")!
  .response as ProgramSolution;
const response = solutionContractScenarios.find(s => s.name === "create_invitation")!
  .response as SolutionInvitationCreated;

describe("Приглашение в решение через существующее окно", () => {
  const create = { execute: vi.fn() };
  const search = {
    state: signal({ status: "initial", users: [] } as {
      status: "initial" | "success";
      users: User[];
    }),
    search: vi.fn(),
  };
  beforeEach(() => {
    create.execute.mockReset().mockReturnValue(of(ok(response)));
    search.search.mockReset();
    search.state.set({ status: "initial", users: [] });
    TestBed.configureTestingModule({
      imports: [SolutionMemberInviteModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CreateSolutionInvitationUseCase, useValue: create },
      ],
    }).overrideComponent(SolutionMemberInviteModalComponent, {
      remove: { providers: [InviteParticipantSearchFacade] },
      add: { providers: [{ provide: InviteParticipantSearchFacade, useValue: search }] },
    });
  });

  async function setup(invitations: SolutionInvitation[] = []) {
    const fixture = TestBed.createComponent(SolutionMemberInviteModalComponent);
    fixture.componentRef.setInput("solution", structuredClone(base));
    fixture.componentRef.setInput("invitations", invitations);
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 20));
    await fixture.whenStable();
    return fixture;
  }

  it("uses program ID for name search and a selected user ID for sending", async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.query.setValue("Ива");
    expect(search.search).toHaveBeenLastCalledWith("Ива", base.programId);
    component.select(candidate);
    component.form.controls.role.setValue("  Backend   разработчик  ");
    component.submit();
    expect(create.execute).toHaveBeenCalledWith(base.programId, base.id, {
      expectedSolutionVersion: base.version,
      recipientUserId: 42,
      role: "Backend разработчик",
    });
  });

  it("blocks empty recipient and whitespace role, including manual submit", async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.form.controls.role.setValue("Аналитик");
    component.submit();
    component.select(candidate);
    component.form.controls.role.setValue("   ");
    component.submit();
    expect(create.execute).not.toHaveBeenCalled();
    expect(component.form.controls.role.hasError("required")).toBe(true);
  });

  it("does not select captain, accepted member or pending recipient", async () => {
    const invitation = {
      ...response.invitation,
      recipient: { ...response.invitation.recipient, id: 42 },
    };
    const fixture = await setup([invitation]);
    const component = fixture.componentInstance;
    component.select({ ...candidate, id: base.captainId });
    expect(component.selected()).toBeNull();
    expect(component.reason(base.captainId)).toBe("Капитан команды");
    component.select(candidate);
    expect(component.selected()).toBeNull();
    expect(component.reason(42)).toBe("Приглашение уже отправлено");
  });

  it("pending blocks duplicate, error preserves selected ID/query/role and allows deliberate retry", async () => {
    const pending = new Subject<Result<SolutionInvitationCreated, SolutionApiError>>();
    create.execute.mockReturnValue(pending);
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.query.setValue("Ива");
    component.select(candidate);
    component.form.controls.role.setValue("Аналитик");
    component.submit();
    component.submit();
    expect(create.execute).toHaveBeenCalledTimes(1);
    expect(component.busy()).toBe(true);
    pending.next(
      fail({
        code: "version_conflict",
        detail: "Заявка изменилась.",
        errors: [],
        meta: { currentVersion: 2 },
      }),
    );
    pending.complete();
    await fixture.whenStable();
    expect(component.error()).toBe("Заявка изменилась.");
    expect(component.selected()?.id).toBe(42);
    expect(component.query.value).toBe("Ива");
    expect(component.form.controls.role.value).toBe("Аналитик");
    expect(component.busy()).toBe(false);
    expect(document.querySelector(".project-invite")?.textContent).toContain("Заявка изменилась.");
  });

  it("success emits only pending invitation and close; does not fabricate team membership", async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const created = vi.fn(),
      closed = vi.fn();
    component.created.subscribe(created);
    component.closed.subscribe(closed);
    component.select(candidate);
    component.form.controls.role.setValue("Аналитик");
    component.submit();
    expect(created).toHaveBeenCalledWith(response);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(component.solution().team.members).toEqual(base.team.members);
    expect(response.invitation.status).toBe("pending");
  });

  it("closing destroys subscriptions and a late response cannot update a newly opened dialog", async () => {
    const pending = new Subject<Result<SolutionInvitationCreated, SolutionApiError>>();
    create.execute.mockReturnValue(pending);
    const fixture = await setup();
    const component = fixture.componentInstance;
    const created = vi.fn();
    component.created.subscribe(created);
    component.select(candidate);
    component.form.controls.role.setValue("Аналитик");
    component.submit();
    fixture.destroy();
    pending.next(ok(response));
    pending.complete();
    expect(created).not.toHaveBeenCalled();
    const reopened = await setup();
    expect(reopened.componentInstance.selected()).toBeNull();
    expect(reopened.componentInstance.form.controls.role.value).toBe("");
  });

  it("clearing selected participant returns focus to name search", async () => {
    const fixture = await setup();
    fixture.componentInstance.select(candidate);
    await fixture.whenStable();
    const clear = document.querySelector<HTMLButtonElement>(".clear-recipient")!;
    clear.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(document.activeElement?.getAttribute("type")).toBe("search");
  });
});
