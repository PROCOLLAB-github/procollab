/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { throwError } from "rxjs";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { DetailProfileInfoService } from "./detail-profile-info.service";

describe("DetailProfileInfoService invite error compatibility", () => {
  it.each([
    [
      400,
      "Нельзя пригласить пользователя: проект относится к программе, а пользователь не является её участником.",
      true,
      false,
    ],
    [400, "У пользователя уже есть активное приглашение в этот проект.", false, true],
    [500, "У пользователя уже есть активное приглашение в этот проект.", false, false],
  ])(
    "uses centralized kinds for existing profile invite states (%s, %s)",
    (status, message, notParticipant, alreadyInvited) => {
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
      facade.selectedProjectId.set(5);
      facade.inviteForm.patchValue({ role: "Дизайнер" });
      facade.sendInvite();
      expect(facade.showNoInProgramModal()).toBe(notParticipant);
      expect(facade.showActiveInviteModal()).toBe(alreadyInvited);
      expect(facade.showSuccessInviteModal()).toBe(false);
    },
  );
});
