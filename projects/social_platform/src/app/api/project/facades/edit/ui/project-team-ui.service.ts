/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";

@Injectable({ providedIn: "root" })
export class ProjectTeamUIService {
  private readonly fb = inject(FormBuilder);

  readonly invites = signal<Invite[]>([]);
  readonly collaborators = signal<Collaborator[]>([]);
  readonly isInviteModalOpen = signal<boolean>(false);
  readonly inviteNotExistingError = signal<Error | null>(null);

  // Состояние отправки формы
  readonly inviteSubmitInitiated = signal(false);
  readonly inviteFormIsSubmitting = signal(false);

  readonly invitesFill = computed(() => this.invites().some(inv => inv.isAccepted === null));

  /**
   * Создает форму приглашения с контролами role, link и specialization, устанавливая валидаторы.
   */
  readonly inviteForm = this.fb.group({
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

  // Геттеры для контролов формы приглашения
  get role() {
    return this.inviteForm.get("role");
  }

  get link() {
    return this.inviteForm.get("link");
  }

  get specialization() {
    return this.inviteForm.get("specialization");
  }

  /**
   * Сбрасывает ошибку отсутствия пользователя при изменении ссылки.
   */
  applyClearLinkError(): void {
    if (this.inviteNotExistingError()) {
      this.inviteNotExistingError.set(null);
    }
  }

  /**
   * Устанавливает список приглашений.
   * @param invites массив Invite
   */
  applySetInvites(invites: Invite[]): void {
    this.invites.set(invites);
  }

  /**
   * Устанавливает список команды
   * @param collaborators массив Collaborator
   */
  applySetCollaborators(collaborators: Collaborator[]): void {
    this.collaborators.set(collaborators);
  }

  /**
   * Открывает модальное окно для отправки приглашения.
   */
  applyOpenInviteModal(): void {
    this.isInviteModalOpen.set(true);
  }

  /**
   * Закрывает модальное окно для отправки приглашения.
   */
  applyCloseInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  applySubmitInvite(invite: Invite): void {
    this.invites.update(list => [...list, invite]);
    this.resetInviteForm();
    this.applyCloseInviteModal();
  }

  applyErrorSubmitInvite(err: any): void {
    this.inviteNotExistingError.set(err);
    this.inviteFormIsSubmitting.set(false);
  }

  applyEditInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.invites.update(list =>
      list.map(i => (i.id === inviteId ? { ...i, role, specialization } : i))
    );
  }

  applyRemoveInvitation(invitationId: number): void {
    this.invites.update(list => list.filter(i => i.id !== invitationId));
  }

  /**
   * Удаляет участника по идентификатору.
   * @param collaboratorId идентификатор приглашения
   */
  applyRemoveCollaborator(collaboratorId: number): void {
    this.collaborators.update(list => list.filter(i => i.userId !== collaboratorId));
  }

  /**
   * Проверяет валидность формы приглашения.
   * @returns boolean true если форма валидна
   */
  applyValidateInviteForm(): boolean {
    return this.inviteForm.valid;
  }

  /**
   * Возвращает текущее значение формы приглашения.
   * @returns any объект значений формы
   */
  applyGetInviteFormValue(): any {
    return this.inviteForm.value;
  }

  /**
   * Сбрасывает форму приглашения и очищает ошибки.
   */
  resetInviteForm(): void {
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
}
