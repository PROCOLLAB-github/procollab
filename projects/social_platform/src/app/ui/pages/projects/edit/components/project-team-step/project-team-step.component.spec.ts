/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { Subject } from "rxjs";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { UpdateInviteUseCase } from "@api/invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "@api/invite/use-cases/revoke-invite.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";
import { ProjectTeamStepComponent } from "./project-team-step.component";

describe("ProjectTeamStepComponent invite form", () => {
  let fixture: ComponentFixture<ProjectTeamStepComponent>;
  let ui: ProjectTeamUIService;
  let request: Subject<Invite>;
  const repo = { sendForUser: vi.fn() };

  beforeEach(async () => {
    request = new Subject<Invite>();
    repo.sendForUser.mockReset().mockReturnValue(request);
    await TestBed.configureTestingModule({
      imports: [ProjectTeamStepComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideNgxMask(),
        ProjectTeamService,
        ProjectTeamUIService,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: ProjectsEditInfoService, useValue: { profileId: signal(5) } },
        { provide: UpdateInviteUseCase, useValue: {} },
        { provide: RevokeInviteUseCase, useValue: {} },
        {
          provide: TooltipInfoService,
          useValue: {
            haveHint: () => false,
            isVisible: () => false,
            tooltipPosition: signal("right"),
          },
        },
      ],
    }).compileComponents();
    ui = TestBed.inject(ProjectTeamUIService);
    fixture = TestBed.createComponent(ProjectTeamStepComponent);
    await fixture.whenStable();
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(".invite__submit button");
  }

  function link(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('app-input[formControlName="link"] input');
  }

  async function fillForm(): Promise<void> {
    button().click();
    await fixture.whenStable();
    const linkInput = link()!;
    linkInput.value = "https://app.procollab.ru/office/profile/13";
    linkInput.dispatchEvent(new Event("input", { bubbles: true }));
    const role: HTMLInputElement = fixture.nativeElement.querySelector(
      'app-input[formControlName="role"] input',
    );
    role.value = "Дизайнер";
    role.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
  }

  it("keeps inputs open through HTTP error, renders alert and succeeds on retry without manual detectChanges", async () => {
    await fillForm();
    button().click();
    await fixture.whenStable();
    expect(repo.sendForUser).toHaveBeenCalledTimes(1);
    expect(link()?.value).toBe("https://app.procollab.ru/office/profile/13");
    expect(button().disabled).toBe(true);
    expect(button().querySelector("app-loader")).not.toBeNull();
    button().click();
    expect(repo.sendForUser).toHaveBeenCalledTimes(1);

    request.error(
      new HttpErrorResponse({
        status: 400,
        error: { user: ["Пользователь уже состоит в проекте."] },
      }),
    );
    await fixture.whenStable();
    expect(button().disabled).toBe(false);
    expect(button().querySelector("app-loader")).toBeNull();
    expect(link()).not.toBeNull();
    expect(ui.role?.value).toBe("Дизайнер");
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent.trim()).toBe(
      "Пользователь уже состоит в команде проекта.",
    );
    expect(fixture.nativeElement.textContent).not.toContain("либо");

    const input = link()!;
    input.value = "https://app.procollab.ru/office/profile/14";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    request = new Subject<Invite>();
    repo.sendForUser.mockReturnValue(request);
    button().click();
    await fixture.whenStable();
    expect(repo.sendForUser).toHaveBeenLastCalledWith(14, 5, "Дизайнер", "");
    const invite = { id: 10, isAccepted: false } as Invite;
    request.next(invite);
    request.complete();
    await fixture.whenStable();
    expect(ui.invites()).toEqual([invite]);
    expect(link()).toBeNull();
    expect(button().textContent).toContain("создать приглашение");
    expect(ui.inviteForm.value).toEqual({ link: null, role: null, specialization: null });
  });

  it("invalid frontend form stays open and never calls the API", async () => {
    button().click();
    await fixture.whenStable();
    button().click();
    await fixture.whenStable();
    expect(link()).not.toBeNull();
    expect(ui.inviteForm.invalid).toBe(true);
    expect(ui.link?.hasError("required")).toBe(true);
    expect(repo.sendForUser).not.toHaveBeenCalled();
  });

  it("never renders raw 500 body", async () => {
    await fillForm();
    button().click();
    request.error(new HttpErrorResponse({ status: 500, error: "error" }));
    await fixture.whenStable();
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent.trim()).toBe(
      "Не удалось отправить приглашение. Попробуйте ещё раз позже.",
    );
    expect(alert?.textContent).not.toContain("error");
    expect(link()).not.toBeNull();
  });
});
