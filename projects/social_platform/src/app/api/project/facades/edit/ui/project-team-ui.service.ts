/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Invite } from "@domain/invite/invite.model";
import { InviteSendError } from "@domain/invite/invite-send-error";
import { Collaborator } from "@domain/project/collaborator.model";
import { AsyncState, failure, initial } from "@domain/shared/async-state";

/** UI-состояние команды проекта в форме редактирования. */
@Injectable()
export class ProjectTeamUIService {
  private readonly fb = inject(FormBuilder);

  readonly invites = signal<Invite[]>([]);
  readonly collaborators = signal<Collaborator[]>([]);
  readonly isInviteModalOpen = signal<boolean>(false);
  readonly inviteSubmitError = signal<InviteSendError | null>(null);
  readonly showInviteFields = signal(false);

  // Состояние отправки формы
  readonly inviteSubmitInitiated = signal(false);
  readonly inviteFormIsSubmitting = signal<AsyncState<void>>(initial());

  readonly isHintTeamModal = signal<boolean>(false);

  readonly invitesFill = computed(() => this.invites().some(inv => inv.isAccepted === null));

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

  applyClearLinkError(): void {
    this.inviteSubmitError.set(null);
  }

  applySetInvites(invites: Invite[]): void {
    this.invites.set(invites);
  }

  applySetCollaborators(collaborators: Collaborator[]): void {
    this.collaborators.set(collaborators);
  }

  applyOpenInviteModal(): void {
    this.isInviteModalOpen.set(true);
  }

  applyOpenHintModal(): void {
    this.isHintTeamModal.set(true);
  }

  applyCloseInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  applySubmitInvite(invite: Invite): void {
    this.invites.update(list => [...list, invite]);
    this.resetInviteForm();
    this.showInviteFields.set(false);
    this.applyCloseInviteModal();
  }

  applyErrorSubmitInvite(error: InviteSendError): void {
    this.inviteSubmitError.set(error);
    this.inviteFormIsSubmitting.set(failure(error.kind));
  }

  applyEditInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    const { inviteId, role, specialization } = params;
    this.invites.update(list =>
      list.map(i => (i.id === inviteId ? { ...i, role, specialization } : i)),
    );
  }

  applyRemoveInvitation(invitationId: number): void {
    this.invites.update(list => list.filter(i => i.id !== invitationId));
  }

  applyRemoveCollaborator(collaboratorId: number): void {
    this.collaborators.update(list => list.filter(i => i.userId !== collaboratorId));
  }

  applyValidateInviteForm(): boolean {
    return this.inviteForm.valid;
  }

  applyGetInviteFormValue(): any {
    return this.inviteForm.value;
  }

  resetInviteForm(): void {
    this.inviteForm.reset();
    this.inviteSubmitInitiated.set(false);
    this.inviteSubmitError.set(null);
    this.inviteFormIsSubmitting.set(initial());
  }
}
