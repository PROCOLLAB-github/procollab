/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ValidationService } from "@corelib";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";
import { SendForUserUseCase } from "../../../invite/use-cases/send-for-user.use-case";
import { UpdateInviteUseCase } from "../../../invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "../../../invite/use-cases/revoke-invite.use-case";
import { loading } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Сервис для управления приглашениями участников команды проекта. */
@Injectable()
export class ProjectTeamService {
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectTeamUIService = inject(ProjectTeamUIService);

  private readonly sendForUserUseCase = inject(SendForUserUseCase);
  private readonly updateInviteUseCase = inject(UpdateInviteUseCase);
  private readonly revokeInviteUseCase = inject(RevokeInviteUseCase);

  private readonly inviteForm = this.projectTeamUIService.inviteForm;
  private readonly inviteSubmitInitiated = this.projectTeamUIService.inviteSubmitInitiated;
  private readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;

  public submitInvite(projectId: number): void {
    this.inviteSubmitInitiated.set(true);
    // Проверка валидности формы
    if (!this.validationService.getFormValidation(this.inviteForm)) {
      return;
    }

    this.inviteFormIsSubmitting.set(loading());

    // Извлечение profileId из URL ссылки
    const linkUrl = new URL(this.inviteForm.get("link")?.value ?? "");
    const pathSegments = linkUrl.pathname.split("/");
    const profileId = Number(pathSegments[pathSegments.length - 1]);

    this.sendForUserUseCase
      .execute({
        userId: profileId,
        projectId,
        role: this.inviteForm.get("role")?.value ?? "",
        specialization: this.inviteForm.get("specialization")?.value ?? "",
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.projectTeamUIService.applyErrorSubmitInvite(result.error.cause);
            return;
          }

          this.projectTeamUIService.applySubmitInvite(result.value);
        },
      });
  }

  public editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.updateInviteUseCase
      .execute({ inviteId, role, specialization })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) return;

          this.projectTeamUIService.applyEditInvitation(params);
        },
      });
  }

  public removeInvitation(invitationId: number): void {
    this.revokeInviteUseCase
      .execute(invitationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectTeamUIService.applyRemoveInvitation(invitationId);
      });
  }

  public setupDynamicValidation(): void {
    this.inviteForm
      .get("link")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value === "") {
          this.inviteForm.get("link")?.clearValidators();
          this.inviteForm.get("link")?.updateValueAndValidity();
        }
        this.projectTeamUIService.applyClearLinkError();
      });
  }
}
