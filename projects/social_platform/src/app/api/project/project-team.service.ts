/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@corelib";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";

/**
 * Сервис для управления приглашениями участников команды проекта.
 * Предоставляет функциональность для создания и валидации формы приглашения,
 * отправки, редактирования и удаления приглашений, управления состоянием модального окна и ошибок.
 */
@Injectable({ providedIn: "root" })
export class ProjectTeamService {
  private inviteForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly inviteService = inject(InviteService);
  private readonly validationService = inject(ValidationService);

  public readonly invites = signal<Invite[]>([]);
  public readonly collaborators = signal<Collaborator[]>([]);
  public readonly isInviteModalOpen = signal<boolean>(false);
  public readonly inviteNotExistingError = signal<Error | null>(null);

  // Состояние отправки формы
  readonly inviteSubmitInitiated = signal(false);
  readonly inviteFormIsSubmitting = signal(false);

  constructor() {
    this.initializeInviteForm();
  }

  /**
   * Создает форму приглашения с контролами role, link и specialization, устанавливая валидаторы.
   */
  private initializeInviteForm(): void {
    this.inviteForm = this.fb.group({
      role: ["", [Validators.required]],
      link: [
        "",
        [
          Validators.required,
          Validators.pattern(/^http(s)?:\/\/.+(:[0-9]*)?\/office\/profile\/\d+$/),
        ],
      ],
      specialization: [null],
    });
  }

  /**
   * Возвращает инстанс формы приглашения.
   * @returns FormGroup inviteForm
   */
  public getInviteForm(): FormGroup {
    return this.inviteForm;
  }

  /**
   * Устанавливает список приглашений.
   * @param invites массив Invite
   */
  public setInvites(invites: Invite[]): void {
    this.invites.set(invites);
  }

  /**
   * Устанавливает список команды
   * @param collaborators массив Collaborator
   */
  public setCollaborators(collaborators: Collaborator[]): void {
    this.collaborators.set(collaborators);
  }

  /**
   * Возвращает текущий список команды.
   * @returns Collaborator[] массив команды
   */
  public getCollaborators(): Collaborator[] {
    return this.collaborators();
  }

  /**
   * Возвращает текущий список приглашений.
   * @returns Invite[] массив приглашений
   */
  public getInvites(): Invite[] {
    return this.invites();
  }

  // Геттеры для контролов формы приглашения
  public get role() {
    return this.inviteForm.get("role");
  }

  public get link() {
    return this.inviteForm.get("link");
  }

  public get specialization() {
    return this.inviteForm.get("specialization");
  }

  /**
   * Открывает модальное окно для отправки приглашения.
   */
  public openInviteModal(): void {
    this.isInviteModalOpen.set(true);
  }

  /**
   * Закрывает модальное окно для отправки приглашения.
   */
  public closeInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  /**
   * Сбрасывает ошибку отсутствия пользователя при изменении ссылки.
   */
  public clearLinkError(): void {
    if (this.inviteNotExistingError()) {
      this.inviteNotExistingError.set(null);
    }
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
    const linkUrl = new URL(this.inviteForm.get("link")?.value);
    const pathSegments = linkUrl.pathname.split("/");
    const profileId = Number(pathSegments[pathSegments.length - 1]);

    this.inviteService
      .sendForUser(
        profileId,
        projectId,
        this.inviteForm.get("role")?.value,
        this.inviteForm.get("specialization")?.value
      )
      .subscribe({
        next: invite => {
          this.invites.update(list => [...list, invite]);
          this.resetInviteForm();
          this.closeInviteModal();
        },
        error: err => {
          this.inviteNotExistingError.set(err);
          this.inviteFormIsSubmitting.set(false);
        },
      });
  }

  /**
   * Обновляет параметры существующего приглашения.
   * @param params объект с inviteId, role и specialization
   */
  public editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.inviteService.updateInvite(inviteId, role, specialization).subscribe(() => {
      this.invites.update(list =>
        list.map(i => (i.id === inviteId ? { ...i, role, specialization } : i))
      );
    });
  }

  /**
   * Удаляет приглашение по идентификатору.
   * @param invitationId идентификатор приглашения
   */
  public removeInvitation(invitationId: number): void {
    this.inviteService.revokeInvite(invitationId).subscribe(() => {
      this.invites.update(list => list.filter(i => i.id !== invitationId));
    });
  }

  /**
   * Удаляет участника по идентификатору.
   * @param collaboratorId идентификатор приглашения
   */
  public removeCollaborator(collaboratorId: number): void {
    this.collaborators.update(list => list.filter(i => i.userId !== collaboratorId));
  }

  /**
   * Проверяет валидность формы приглашения.
   * @returns boolean true если форма валидна
   */
  public validateInviteForm(): boolean {
    return this.inviteForm.valid;
  }

  /**
   * Возвращает текущее значение формы приглашения.
   * @returns any объект значений формы
   */
  public getInviteFormValue(): any {
    return this.inviteForm.value;
  }

  /**
   * Сбрасывает форму приглашения и очищает ошибки.
   */
  public resetInviteForm(): void {
    this.inviteForm.reset();
    Object.keys(this.inviteForm.controls).forEach(name => {
      const ctrl = this.inviteForm.get(name);
      ctrl?.clearValidators();
      ctrl?.markAsPristine();
      ctrl?.updateValueAndValidity();
    });
    this.inviteNotExistingError.set(null);
    this.inviteFormIsSubmitting.set(false);
  }

  /**
   * Настроивает динамическую валидацию для поля link:
   * сбрасывает валидаторы при пустом значении и очищает ошибку.
   */
  public setupDynamicValidation(): void {
    this.inviteForm.get("link")?.valueChanges.subscribe(value => {
      if (value === "") {
        this.inviteForm.get("link")?.clearValidators();
        this.inviteForm.get("link")?.updateValueAndValidity();
      }
      this.clearLinkError();
    });
  }
}
