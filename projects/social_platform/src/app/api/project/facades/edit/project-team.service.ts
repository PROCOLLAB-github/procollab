/** @format */

import { inject, Injectable } from "@angular/core";
import { ValidationService } from "@corelib";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";
import { Subject, takeUntil } from "rxjs";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";

/**
 * Сервис для управления приглашениями участников команды проекта.
 * Предоставляет функциональность для создания и валидации формы приглашения,
 * отправки, редактирования и удаления приглашений, управления состоянием модального окна и ошибок.
 */
@Injectable()
export class ProjectTeamService {
  private readonly inviteService = inject(InviteService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly validationService = inject(ValidationService);

  private readonly destroy$ = new Subject<void>();

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

    this.inviteService
      .sendForUser(
        profileId,
        projectId,
        this.inviteForm.get("role")?.value ?? "",
        this.inviteForm.get("specialization")?.value ?? ""
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invite => {
          this.projectTeamUIService.applySubmitInvite(invite);
        },
        error: err => {
          this.projectTeamUIService.applyErrorSubmitInvite(err);
        },
      });
  }

  /**
   * Обновляет параметры существующего приглашения.
   * @param params объект с inviteId, role и specialization
   */
  public editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.inviteService
      .updateInvite(inviteId, role, specialization)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.projectTeamUIService.applyEditInvitation(params));
  }

  /**
   * Удаляет приглашение по идентификатору.
   * @param invitationId идентификатор приглашения
   */
  public removeInvitation(invitationId: number): void {
    this.inviteService
      .revokeInvite(invitationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.projectTeamUIService.applyRemoveInvitation(invitationId));
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
