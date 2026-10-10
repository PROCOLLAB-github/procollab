/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../../../../ui/src/lib/services/desktop-layout.service";

import { ButtonDirective } from "@uilib";

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Invite } from "@domain/invite/invite.model";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { inviteRoleValidator } from "@api/invite/project-invite-form";
import { IconComponent } from "@ui/primitives";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ProjectInviteDialogComponent } from "@ui/widgets/project-invite/project-invite-dialog.component";
import { ProjectInviteRoleInputComponent } from "@ui/widgets/project-invite/project-invite-role-input.component";

/** Ожидающее приглашение: существующие PATCH роли и DELETE приглашения. */
@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrl: "./invite-card.component.scss",
  imports: [
    ButtonDirective,
    IconComponent,
    AvatarComponent,
    ReactiveFormsModule,
    ProjectInviteDialogComponent,
    ProjectInviteRoleInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteCardComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  readonly invite = input.required<Invite>();
  readonly remove = output<number>();
  readonly edit = output<{ inviteId: number; role: string; specialization: string }>();
  readonly role = new FormControl("", { nonNullable: true, validators: [inviteRoleValidator] });
  readonly isRemoveInviteModal = signal(false);
  readonly isEditInviteModal = signal(false);
  protected trigger: HTMLElement | null = null;
  readonly sentDate = computed(() => {
    const value = this.invite().datetimeCreated;
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? null
      : new Intl.DateTimeFormat("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date);
  });
  openEdit(event: Event): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.role.reset(this.invite().role ?? "");
    this.isEditInviteModal.set(true);
  }
  openRemove(event: Event): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.isRemoveInviteModal.set(true);
  }
  onRemove(): void {
    this.isRemoveInviteModal.set(false);
    this.remove.emit(this.invite().id);
  }
  onEdit(): void {
    this.role.setValue(normalizeInviteText(this.role.value));
    this.role.markAsTouched();
    if (this.role.invalid) return;
    this.edit.emit({
      inviteId: this.invite().id,
      role: this.role.value,
      specialization: this.invite().specialization ?? "",
    });
    this.isEditInviteModal.set(false);
  }
}
