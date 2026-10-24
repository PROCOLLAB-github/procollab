/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ButtonDirective, StateComponent } from "@uilib";
import { User } from "@domain/auth/user.model";
import { InviteSearchState } from "@api/invite/facades/invite-participant-search.facade";
import { ParticipantPickerComponent } from "./participant-picker.component";
import { ProjectInviteDialogComponent } from "./project-invite-dialog.component";
import { ProjectInviteRoleInputComponent } from "./project-invite-role-input.component";

let nextSearchId = 0;

/** Представление существующего окна: владелец и API остаются во внешнем адаптере. */
@Component({
  selector: "app-member-invite-form",
  imports: [
    ReactiveFormsModule,
    ButtonDirective,
    StateComponent,
    ParticipantPickerComponent,
    ProjectInviteDialogComponent,
    ProjectInviteRoleInputComponent,
  ],
  templateUrl: "./member-invite-form.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberInviteFormComponent {
  readonly query = input.required<FormControl<string>>();
  readonly role = input.required<FormControl<string>>();
  readonly state = input.required<InviteSearchState>();
  readonly selected = input<User | null>(null);
  readonly unavailableReason = input.required<(id: number) => string | null>();
  readonly busy = input(false);
  readonly valid = input(false);
  readonly error = input("");
  readonly trigger = input<HTMLElement | null>(null);
  readonly description = input("Найдите участника и укажите его роль в проекте");
  readonly roleLabel = input("Роль в проекте");
  readonly closed = output<void>();
  readonly chosen = output<User>();
  readonly cleared = output<void>();
  readonly submitted = output<void>();
  readonly searchId = "team-invite-search-" + ++nextSearchId;
  @ViewChild("searchInput") private searchInput!: ElementRef<HTMLInputElement>;

  clear(): void {
    this.cleared.emit();
    this.searchInput.nativeElement.focus();
  }
}
