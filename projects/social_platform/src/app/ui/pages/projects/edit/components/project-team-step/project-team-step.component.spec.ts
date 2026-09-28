/** @format */
import { HttpErrorResponse } from "@angular/common/http";
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { Subject, of } from "rxjs";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { UpdateInviteUseCase } from "@api/invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "@api/invite/use-cases/revoke-invite.use-case";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";
import { ProjectTeamStepComponent } from "./project-team-step.component";

describe("Окно приглашения из редактора команды", () => {
  let fixture: ComponentFixture<ProjectTeamStepComponent>;
  let ui: ProjectTeamUIService;
  let request: Subject<Invite>;
  const repo = { sendForUser: vi.fn() };
  const users = [1, 2, 3, 13].map(id => ({
    id,
    firstName: "Иван",
    lastName: "Петров " + id,
    personal: { speciality: "Аналитик", birthday: "2000-01-01" },
    relations: {
      skills: [
        { id: 1, name: "SQL" },
        { id: 2, name: "Аналитика" },
        { id: 3, name: "Python" },
      ],
    },
  }));
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
        { provide: RemoveProjectCollaboratorUseCase, useValue: {} },
        { provide: InviteRepositoryPort, useValue: repo },
        {
          provide: ProjectsEditInfoService,
          useValue: {
            profileId: signal(5),
            invitationProject: signal({ id: 5, leader: 1, partnerProgram: { programId: 27 } }),
          },
        },
        { provide: UpdateInviteUseCase, useValue: {} },
        { provide: RevokeInviteUseCase, useValue: {} },
        {
          provide: GetMembersUseCase,
          useValue: { execute: () => of({ ok: true, value: { results: users } }) },
        },
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
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
  });
  afterEach(() => fixture?.nativeElement.remove());
  const dialog = () => document.querySelector(".project-invite")!;
  async function open() {
    fixture.nativeElement.querySelector(".invite__submit button").click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 20));
    await fixture.whenStable();
  }
  async function search() {
    const input = dialog().querySelector('input[type="search"]') as HTMLInputElement;
    input.value = "Иван";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 330));
    await fixture.whenStable();
  }
  it("CTA открывает окно с поиском, URL отсутствует, отправка неактивна до выбора и роли", async () => {
    await open();
    expect(ui.isInviteModalOpen()).toBe(true);
    expect(dialog().textContent).toContain("Введите имя или фамилию участника");
    expect(document.querySelector('[formControlName="link"]')).toBeNull();
    expect(dialog().textContent).not.toContain("ссылка на пользователя");
    expect((dialog().querySelector(".invite-button--primary") as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(document.activeElement).toBe(dialog().querySelector('input[type="search"]'));
  });
  it("показывает public data, причины disabled, выбирает строку и очищает выбор", async () => {
    await open();
    ui.collaborators.set([
      { userId: 2, firstName: "Иван", lastName: "Петров", role: "Аналитик", skills: [] },
    ] as any);
    ui.invites.set([{ id: 30, user: users[2], role: "Аналитик", isAccepted: null }] as any);
    // Карточки вне окна не входят в предмет этой проверки.
    await search();
    const rows = Array.from(dialog().querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    expect(rows.map(row => row.disabled)).toEqual([true, true, true, false]);
    expect(rows[0].textContent).toContain("Руководитель проекта");
    expect(rows[1].textContent).toContain("Уже в команде");
    expect(rows[2].textContent).toContain("Приглашение уже отправлено");
    expect(rows[3].textContent).toContain("SQL");
    expect(rows[3].textContent).toContain("+1");
    rows[3].click();
    await fixture.whenStable();
    expect(ui.inviteForm.controls.recipientId.value).toBe(13);
    expect(dialog().textContent).toContain("Выбранный участник");
    (
      dialog().querySelector('[aria-label="Очистить выбранного участника"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(ui.selectedRecipient()).toBeNull();
    expect(ui.inviteForm.controls.recipientId.value).toBeNull();
    expect(dialog().querySelectorAll('[role="radio"]').length).toBe(4);
  });
  it("ошибка inline сохраняет выбор/роль, повтор защищён, успех закрывает и возвращает фокус", async () => {
    await open();
    await search();
    (dialog().querySelectorAll('[role="radio"]')[3] as HTMLButtonElement).click();
    const input = dialog().querySelector('[role="combobox"]') as HTMLInputElement;
    input.value = "Дизайнер";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    const send = dialog().querySelector(".invite-button--primary") as HTMLButtonElement;
    send.click();
    send.click();
    await fixture.whenStable();
    expect(repo.sendForUser).toHaveBeenCalledExactlyOnceWith(13, 5, "Дизайнер", undefined);
    expect(send.disabled).toBe(true);
    request.error(new HttpErrorResponse({ status: 500, error: "private details" }));
    await fixture.whenStable();
    expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(
      "Попробуйте ещё раз позже",
    );
    expect(ui.selectedRecipient()?.id).toBe(13);
    expect(ui.role?.value).toBe("Дизайнер");
    request = new Subject<Invite>();
    repo.sendForUser.mockReturnValue(request);
    send.click();
    request.next({ id: 90, isAccepted: false } as Invite);
    await fixture.whenStable();
    expect(document.querySelector(".project-invite")).toBeNull();
    expect(ui.invites()[0].id).toBe(90);
    expect(ui.inviteForm.getRawValue()).toEqual({ recipientId: null, role: "" });
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector(".invite__submit button"),
    );
  });
});
