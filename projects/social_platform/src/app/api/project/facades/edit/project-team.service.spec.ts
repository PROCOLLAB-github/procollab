/** @format */
import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Subject, of } from "rxjs";
import { Invite } from "@domain/invite/invite.model";
import { User } from "@domain/auth/user.model";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { UpdateInviteUseCase } from "@api/invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "@api/invite/use-cases/revoke-invite.use-case";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ProjectTeamService } from "./project-team.service";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";

describe("Отправка приглашения из команды", () => {
  let service: ProjectTeamService;
  let ui: ProjectTeamUIService;
  let request: Subject<Invite>;
  const repo = { sendForUser: vi.fn() };
  const snackbar = { success: vi.fn() };
  const update = { execute: vi.fn() };
  const revoke = { execute: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    request = new Subject<Invite>();
    repo.sendForUser.mockReturnValue(request);
    TestBed.configureTestingModule({
      providers: [
        ProjectTeamService,
        ProjectTeamUIService,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: SnackbarService, useValue: snackbar },
        { provide: UpdateInviteUseCase, useValue: update },
        { provide: RevokeInviteUseCase, useValue: revoke },
      ],
    });
    service = TestBed.inject(ProjectTeamService);
    ui = TestBed.inject(ProjectTeamUIService);
    service.setupDynamicValidation();
    ui.applyOpenInviteModal();
    ui.selectRecipient({ id: 13 } as User);
    ui.inviteForm.controls.role.setValue("  Эксперт   по работе с промышленными партнёрами  ");
  });

  it("передаёт ID и нормализованную свободную роль, блокирует повтор, добавляет pending и сбрасывает окно", () => {
    service.submitInvite(5);
    service.submitInvite(5);
    expect(repo.sendForUser).toHaveBeenCalledExactlyOnceWith(
      13,
      5,
      "Эксперт по работе с промышленными партнёрами",
      undefined,
    );
    expect(ui.isInviteModalOpen()).toBe(true);
    expect(ui.inviteFormIsSubmitting().status).toBe("loading");
    const invite = { id: 10, isAccepted: null } as Invite;
    request.next(invite);
    expect(ui.invites()).toEqual([invite]);
    expect(ui.isInviteModalOpen()).toBe(false);
    expect(ui.inviteForm.getRawValue()).toEqual({ recipientId: null, role: "" });
    expect(ui.selectedRecipient()).toBeNull();
    expect(ui.inviteFormIsSubmitting().status).toBe("initial");
    expect(snackbar.success).toHaveBeenCalledWith("Приглашение отправлено");
  });

  it.each([null, 0, -1, 1.5, NaN])("не отправляет невалидный recipientId %s", id => {
    ui.inviteForm.controls.recipientId.setValue(id);
    service.submitInvite(5);
    expect(repo.sendForUser).not.toHaveBeenCalled();
  });

  it.each(["", "   ", "я".repeat(129)])("не отправляет невалидную роль", role => {
    ui.inviteForm.controls.role.setValue(role);
    service.submitInvite(5);
    expect(repo.sendForUser).not.toHaveBeenCalled();
    expect(ui.role?.touched).toBe(true);
  });

  it.each([
    [400, { user: ["Пользователь уже состоит в проекте."] }, "already_member"],
    [
      400,
      { user: ["У пользователя уже есть активное приглашение в этот проект."] },
      "already_invited",
    ],
    [
      400,
      {
        user: [
          "Нельзя пригласить пользователя: проект относится к программе, а пользователь не является её участником.",
        ],
      },
      "not_program_participant",
    ],
    [403, {}, "forbidden"],
    [0, {}, "network"],
    [500, "private details", "server"],
  ])("сохраняет выбор и роль после typed error %s", (status, error, kind) => {
    service.submitInvite(5);
    request.error(new HttpErrorResponse({ status: status as number, error }));
    expect(ui.inviteSubmitError()?.kind).toBe(kind);
    expect(ui.isInviteModalOpen()).toBe(true);
    expect(ui.selectedRecipient()?.id).toBe(13);
    expect(ui.role?.value).toBe("Эксперт по работе с промышленными партнёрами");
    expect(ui.inviteFormIsSubmitting().status).toBe("failure");
    expect(ui.inviteSubmitError()?.message).not.toContain("private details");
  });

  it("закрытие отменяет запрос; поздний ответ не затрагивает следующее открытие", () => {
    service.submitInvite(5);
    expect(request.observed).toBe(true);
    ui.applyCloseInviteModal();
    expect(request.observed).toBe(false);
    ui.applyOpenInviteModal();
    request.next({ id: 99 } as Invite);
    expect(ui.invites()).toEqual([]);
    expect(ui.isInviteModalOpen()).toBe(true);
    expect(ui.inviteFormIsSubmitting().status).toBe("initial");
  });

  it("демонтаж отменяет запрос", () => {
    service.submitInvite(5);
    TestBed.resetTestingModule();
    expect(request.observed).toBe(false);
  });

  it("legacy edit сохраняет specialization, revoke удаляет карточку", () => {
    ui.invites.set([{ id: 10, role: "Старая", specialization: "Legacy" } as Invite]);
    update.execute.mockReturnValue(of({ ok: true }));
    revoke.execute.mockReturnValue(of({ ok: true }));
    service.editInvitation({ inviteId: 10, role: "Новая", specialization: "Legacy2" });
    expect(ui.invites()[0]).toMatchObject({ role: "Новая", specialization: "Legacy2" });
    service.removeInvitation(10);
    expect(revoke.execute).toHaveBeenCalledWith(10);
    expect(ui.invites()).toEqual([]);
  });
});
