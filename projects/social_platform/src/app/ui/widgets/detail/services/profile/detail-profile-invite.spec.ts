/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { Subject, throwError } from "rxjs";
import { Project } from "@domain/project/project.model";
import { Invite } from "@domain/invite/invite.model";
import { Router } from "@angular/router";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { DetailProfileInfoService } from "./detail-profile-info.service";

describe("DetailProfileInfoService invite error compatibility", () => {
  it.each([7, 13])(
    "copies the viewed profile URL through the existing clipboard flow (%s)",
    async profileId => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      const success = vi.fn();
      const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
      try {
        TestBed.configureTestingModule({
          providers: [
            provideRouter([]),
            DetailProfileInfoService,
            ProjectTeamUIService,
            { provide: SnackbarService, useValue: { success, error: vi.fn() } },
            { provide: ProfileInfoService, useValue: { profile: signal({ id: 7 }) } },
            { provide: ProfileDetailUIInfoService, useValue: {} },
            { provide: AuthRepositoryPort, useValue: {} },
            { provide: DownloadCvUseCase, useValue: {} },
            { provide: InviteRepositoryPort, useValue: {} },
          ],
        });
        TestBed.inject(DetailProfileInfoService).onCopyLink(profileId);
        await Promise.resolve();
        expect(writeText).toHaveBeenCalledExactlyOnceWith(
          `${location.origin}/office/profile/${profileId}/`,
        );
        expect(success).toHaveBeenCalledExactlyOnceWith("скопирован URL");
      } finally {
        if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
        else Reflect.deleteProperty(navigator, "clipboard");
      }
    },
  );

  it.each([
    [
      400,
      "Нельзя пригласить пользователя: проект относится к программе, а пользователь не является её участником.",
      "not_program_participant",
    ],
    [400, "У пользователя уже есть активное приглашение в этот проект.", "already_invited"],
    [500, "У пользователя уже есть активное приглашение в этот проект.", "server"],
  ])(
    "uses centralized kinds for existing profile invite states (%s, %s)",
    (status, message, kind) => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          DetailProfileInfoService,
          ProjectTeamUIService,
          { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 13 } } } },
          { provide: SnackbarService, useValue: {} },
          { provide: ProfileInfoService, useValue: { profile: signal(null) } },
          { provide: ProfileDetailUIInfoService, useValue: {} },
          { provide: AuthRepositoryPort, useValue: {} },
          { provide: DownloadCvUseCase, useValue: {} },
          {
            provide: InviteRepositoryPort,
            useValue: {
              sendForUser: () =>
                throwError(() => new HttpErrorResponse({ status, error: { user: [message] } })),
            },
          },
        ],
      });
      const facade = TestBed.inject(DetailProfileInfoService);
      facade.profileProjects.set([{ id: 5 } as Project]);
      facade.inviteUser();
      facade.selectedProjectId.set(5);
      facade.inviteForm.patchValue({ role: "Дизайнер" });
      facade.sendInvite();
      expect(facade.inviteError()?.kind).toBe(kind);
      expect(facade.showSendInviteModal()).toBe(true);
      expect(facade.selectedProjectId()).toBe(5);
      expect(facade.inviteForm.controls.role.value).toBe("Дизайнер");
      expect(facade.inviteLoading()).toBe(false);
    },
  );
});

describe("Жизненный цикл приглашения из профиля", () => {
  const repo = { sendForUser: vi.fn() };
  const snackbar = { success: vi.fn() };
  let response: Subject<Invite>;
  let facade: DetailProfileInfoService;
  beforeEach(() => {
    vi.clearAllMocks();
    response = new Subject<Invite>();
    repo.sendForUser.mockReturnValue(response);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        DetailProfileInfoService,
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: "13" } } } },
        { provide: SnackbarService, useValue: snackbar },
        { provide: ProfileInfoService, useValue: { profile: signal(null) } },
        { provide: ProfileDetailUIInfoService, useValue: {} },
        { provide: AuthRepositoryPort, useValue: {} },
        { provide: DownloadCvUseCase, useValue: {} },
        { provide: InviteRepositoryPort, useValue: repo },
      ],
    });
    facade = TestBed.inject(DetailProfileInfoService);
    facade.profileProjects.set([{ id: 5 } as Project]);
    facade.inviteUser();
  });
  it("открывается с известным числовым recipientId; без проекта/роли не отправляет", () => {
    expect(facade.showSendInviteModal()).toBe(true);
    expect(facade.inviteForm.controls.recipientId.value).toBe(13);
    facade.sendInvite();
    facade.selectedProjectId.set(5);
    facade.sendInvite();
    facade.selectedProjectId.set(null);
    facade.inviteForm.controls.role.setValue("Эксперт");
    facade.sendInvite();
    expect(repo.sendForUser).not.toHaveBeenCalled();
  });
  it("success: точные ID и роль, один запрос, reset, snackbar, без навигации", () => {
    const navigate = vi.spyOn(TestBed.inject(Router), "navigate");
    facade.selectedProjectId.set(5);
    facade.inviteForm.controls.role.setValue("  Эксперт   по промышленным партнёрам ");
    facade.sendInvite();
    facade.sendInvite();
    expect(repo.sendForUser).toHaveBeenCalledExactlyOnceWith(
      13,
      5,
      "Эксперт по промышленным партнёрам",
      undefined,
    );
    expect(facade.inviteLoading()).toBe(true);
    response.next({ id: 99 } as Invite);
    expect(facade.showSendInviteModal()).toBe(false);
    expect(facade.selectedProjectId()).toBeNull();
    expect(facade.inviteForm.getRawValue()).toEqual({ recipientId: null, role: "" });
    expect(snackbar.success).toHaveBeenCalledWith("Приглашение отправлено");
    expect(navigate).not.toHaveBeenCalled();
  });
  it("close/reopen отменяет старый ответ и сбрасывает форму и error", () => {
    facade.selectedProjectId.set(5);
    facade.inviteForm.controls.role.setValue("Эксперт");
    facade.sendInvite();
    facade.closeInvite();
    expect(response.observed).toBe(false);
    facade.inviteUser();
    response.next({ id: 99 } as Invite);
    expect(facade.showSendInviteModal()).toBe(true);
    expect(facade.inviteLoading()).toBe(false);
    expect(facade.inviteError()).toBeNull();
    expect(facade.inviteForm.controls.role.value).toBe("");
    expect(facade.selectedProjectId()).toBeNull();
  });
  it("без проектов открывает то же окно", () => {
    facade.closeInvite();
    facade.profileProjects.set([]);
    facade.inviteUser();
    expect(facade.showSendInviteModal()).toBe(true);
  });
});
