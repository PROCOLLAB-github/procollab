/** @format */

import { inject, Injectable } from "@angular/core";
import { ValidationService } from "@corelib";
import { Subject, takeUntil } from "rxjs";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";
import { SendForUserUseCase } from "../../../invite/use-cases/send-for-user.use-case";
import { UpdateInviteUseCase } from "../../../invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "../../../invite/use-cases/revoke-invite.use-case";

/**
 * Сервис для управления приглашениями участников команды проекта.
 * Предоставляет функциональность для создания и валидации формы приглашения,
 * отправки, редактирования и удаления приглашений, управления состоянием модального окна и ошибок.
 */
@Injectable()
export class ProjectTeamService {
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly validationService = inject(ValidationService);

  private readonly destroy$ = new Subject<void>();

  private readonly sendForUserUseCase = inject(SendForUserUseCase);
  private readonly updateInviteUseCase = inject(UpdateInviteUseCase);
  private readonly revokeInviteUseCase = inject(RevokeInviteUseCase);

  private readonly inviteForm = this.projectTeamUIService.inviteForm;
  private readonly inviteSubmitInitiated = this.projectTeamUIService.inviteSubmitInitiated;
  private readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Отправляет приглашение пользователю по ссылке.
   * @returns результат отправки
   */
  public submitInvite(projectId: number): void {
    this.inviteSubmitInitiated.set(true);
    // Проверка валидности формы
    if (!this.validationService.getFormValidation(this.inviteForm)) {
      return;
    }

    this.inviteFormIsSubmitting.set(true);

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
      .pipe(takeUntil(this.destroy$))
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

  /**
   * Обновляет параметры существующего приглашения.
   * @param params объект с inviteId, role и specialization
   */
  public editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.updateInviteUseCase
      .execute({ inviteId, role, specialization })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) return;

          this.projectTeamUIService.applyEditInvitation(params);
        },
      });
  }

  /**
   * Удаляет приглашение по идентификатору.
   * @param invitationId идентификатор приглашения
   */
  public removeInvitation(invitationId: number): void {
    this.revokeInviteUseCase
      .execute(invitationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectTeamUIService.applyRemoveInvitation(invitationId);
      });
  }

  /**
   * Настроивает динамическую валидацию для поля link:
   * сбрасывает валидаторы при пустом значении и очищает ошибку.
   */
  public setupDynamicValidation(): void {
    this.inviteForm
      .get("link")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === "") {
          this.inviteForm.get("link")?.clearValidators();
          this.inviteForm.get("link")?.updateValueAndValidity();
        }
        this.projectTeamUIService.applyClearLinkError();
      });
  }
}
