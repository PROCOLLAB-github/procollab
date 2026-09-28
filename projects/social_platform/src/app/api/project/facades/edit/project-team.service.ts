/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ValidationService } from "@corelib";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";
import { SendForUserUseCase } from "../../../invite/use-cases/send-for-user.use-case";
import { UpdateInviteUseCase } from "../../../invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "../../../invite/use-cases/revoke-invite.use-case";
import { isLoading, loading } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { takeUntil } from "rxjs";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { SnackbarService } from "@domain/shared/snackbar.service";

/** Сервис для управления приглашениями участников команды проекта. */
@Injectable()
export class ProjectTeamService {
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackbar = inject(SnackbarService);

  private readonly projectTeamUIService = inject(ProjectTeamUIService);

  private readonly sendForUserUseCase = inject(SendForUserUseCase);
  private readonly updateInviteUseCase = inject(UpdateInviteUseCase);
  private readonly revokeInviteUseCase = inject(RevokeInviteUseCase);

  private readonly inviteForm = this.projectTeamUIService.inviteForm;
  private readonly inviteSubmitInitiated = this.projectTeamUIService.inviteSubmitInitiated;
  private readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;

  public submitInvite(projectId: number): void {
    if (isLoading(this.inviteFormIsSubmitting())) return;
    if (!Number.isSafeInteger(projectId) || projectId <= 0) return;
    this.projectTeamUIService.applyClearInviteError();
    this.inviteForm.controls.role.setValue(
      normalizeInviteText(this.inviteForm.controls.role.value),
    );
    this.inviteSubmitInitiated.set(true);
    // Проверка валидности формы
    if (!this.validationService.getFormValidation(this.inviteForm)) {
      return;
    }

    this.inviteFormIsSubmitting.set(loading());

    this.sendForUserUseCase
      .execute({
        userId: this.inviteForm.controls.recipientId.value!,
        projectId,
        role: this.inviteForm.controls.role.value,
      })
      .pipe(takeUntil(this.projectTeamUIService.inviteClosed), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.projectTeamUIService.applyErrorSubmitInvite(result.error);
            return;
          }

          this.projectTeamUIService.applySubmitInvite(result.value);
          this.snackbar.success("Приглашение отправлено");
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
          if (!result.ok) {
            this.snackbar.error("Не удалось изменить роль в приглашении. Попробуйте ещё раз.");
            return;
          }

          this.projectTeamUIService.applyEditInvitation(params);
        },
      });
  }

  public removeInvitation(invitationId: number): void {
    this.revokeInviteUseCase
      .execute(invitationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.snackbar.error("Не удалось отозвать приглашение. Попробуйте ещё раз.");
          return;
        }

        this.projectTeamUIService.applyRemoveInvitation(invitationId);
      });
  }

  public setupDynamicValidation(): void {
    // Правки убирают серверную ошибку, но не меняют клиентские валидаторы.
    this.inviteForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.projectTeamUIService.applyClearInviteError();
    });
  }
}
