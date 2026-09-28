/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { createProjectInviteForm } from "@api/invite/project-invite-form";
import { User } from "@domain/auth/user.model";
import { Invite } from "@domain/invite/invite.model";
import { InviteSendError } from "@domain/invite/invite-send-error";
import { Collaborator } from "@domain/project/collaborator.model";
import { AsyncState, failure, initial } from "@domain/shared/async-state";

/** UI-состояние команды проекта в форме редактирования. */
@Injectable()
export class ProjectTeamUIService {
  readonly inviteClosed = new Subject<void>();
  readonly selectedRecipient = signal<User | null>(null);

  readonly invites = signal<Invite[]>([]);
  readonly collaborators = signal<Collaborator[]>([]);
  readonly isInviteModalOpen = signal<boolean>(false);
  readonly inviteSubmitError = signal<InviteSendError | null>(null);

  // Состояние отправки формы
  readonly inviteSubmitInitiated = signal(false);
  readonly inviteFormIsSubmitting = signal<AsyncState<void>>(initial());

  readonly isHintTeamModal = signal<boolean>(false);

  readonly invitesFill = computed(() => this.invites().some(inv => inv.isAccepted === null));

  readonly inviteForm = createProjectInviteForm();

  // Геттеры для контролов формы приглашения
  get role() {
    return this.inviteForm.get("role");
  }

  selectRecipient(user: User | null): void {
    this.selectedRecipient.set(user);
    this.inviteForm.controls.recipientId.setValue(user?.id ?? null);
    this.inviteSubmitError.set(null);
  }

  applyClearInviteError(): void {
    this.inviteSubmitError.set(null);
  }

  applySetInvites(invites: Invite[]): void {
    this.invites.set(invites);
  }

  applySetCollaborators(collaborators: Collaborator[]): void {
    this.collaborators.set(collaborators);
  }

  applyOpenInviteModal(): void {
    this.inviteClosed.next();
    this.resetInviteForm();
    this.isInviteModalOpen.set(true);
  }

  applyOpenHintModal(): void {
    this.isHintTeamModal.set(true);
  }

  applyCloseInviteModal(): void {
    this.inviteClosed.next();
    this.isInviteModalOpen.set(false);
    this.resetInviteForm();
  }

  applySubmitInvite(invite: Invite): void {
    this.invites.update(list => [...list, invite]);
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
    this.selectedRecipient.set(null);
    this.inviteSubmitInitiated.set(false);
    this.inviteSubmitError.set(null);
    this.inviteFormIsSubmitting.set(initial());
  }
}
