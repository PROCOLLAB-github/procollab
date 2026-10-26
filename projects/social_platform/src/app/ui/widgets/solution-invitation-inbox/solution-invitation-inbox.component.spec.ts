/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { of } from "rxjs";
import { SolutionInvitationInboxService } from "@api/solution/facades/solution-invitation-inbox.service";
import { SolutionInvitationCreated } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { SolutionInvitationInboxComponent } from "./solution-invitation-inbox.component";

const created = (
  solutionContractScenarios.find(s => s.name === "create_invitation")!
    .response as SolutionInvitationCreated
).invitation;
const invitation = {
  ...created,
  permissions: { canAccept: true, canDecline: true, canEdit: false, canRevoke: false },
};

describe("Получатель приглашения в решение", () => {
  const inbox = {
    items: signal([invitation]),
    loading: signal(false),
    error: signal(""),
    pendingId: signal<number | null>(null),
    action: vi.fn(),
    refresh: vi.fn(),
  };
  beforeEach(() => {
    inbox.action.mockReset();
    inbox.items.set([invitation]);
    inbox.pendingId.set(null);
    TestBed.configureTestingModule({
      imports: [SolutionInvitationInboxComponent],
      providers: [provideRouter([]), { provide: SolutionInvitationInboxService, useValue: inbox }],
    });
  });

  it("shows program/role without a Project link and navigates only after accepted application", () => {
    const fixture = TestBed.createComponent(SolutionInvitationInboxComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(invitation.program.name);
    expect(fixture.nativeElement.querySelector('a[href*="/office/projects/"]')).toBeNull();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    inbox.action.mockReturnValue(
      of(
        ok({
          invitation: { ...invitation, status: "accepted" },
          application: invitation.solution,
          solutionVersion: 3,
        }),
      ),
    );
    (Array.from(fixture.nativeElement.querySelectorAll("button")) as HTMLButtonElement[])
      .find(button => button.textContent?.trim() === "принять")!
      .click();
    expect(navigate).toHaveBeenCalledWith(
      [
        `/office/program/${invitation.solution.programId}/solutions/${invitation.solution.solutionId}`,
      ],
      { queryParams: { tab: "team" } },
    );
  });

  it("does not report success or navigate on rejected acceptance", () => {
    const fixture = TestBed.createComponent(SolutionInvitationInboxComponent);
    fixture.detectChanges();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true),
      handled = vi.fn();
    fixture.componentInstance.handled.subscribe(handled);
    inbox.action.mockReturnValue(
      of(fail({ code: "team_frozen", detail: "Состав зафиксирован.", errors: [], meta: {} })),
    );
    (Array.from(fixture.nativeElement.querySelectorAll("button")) as HTMLButtonElement[])
      .find(button => button.textContent?.trim() === "принять")!
      .click();
    expect(navigate).not.toHaveBeenCalled();
    expect(handled).not.toHaveBeenCalled();
  });

  it("keeps acceptance disabled for a frozen solution while allowing decline", () => {
    inbox.items.set([
      { ...invitation, permissions: { ...invitation.permissions, canAccept: false } },
    ]);
    const fixture = TestBed.createComponent(SolutionInvitationInboxComponent);
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll("button"),
    ) as HTMLButtonElement[];
    expect(buttons.find(button => button.textContent?.trim() === "принять")!.disabled).toBe(true);
    expect(buttons.find(button => button.textContent?.trim() === "отклонить")!.disabled).toBe(
      false,
    );
  });
});
