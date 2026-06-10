/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  output,
  Output,
  signal,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { Invite } from "@domain/invite/invite.model";
import { IconComponent, ButtonComponent, SelectComponent, InputComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { rolesMembersList } from "@core/consts/lists/roles-members-list.const";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { TruncatePipe, ControlErrorPipe } from "@corelib";

/** Карточка приглашения в команду с редактированием и удалением. */
@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrl: "./invite-card.component.scss",
  imports: [
    IconComponent,
    ButtonComponent,
    ModalComponent,
    SelectComponent,
    ControlErrorPipe,
    TruncatePipe,
    ReactiveFormsModule,
    InputComponent,
    AvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteCardComponent implements OnInit {
  constructor(private readonly fb: FormBuilder) {
    this.inviteForm = this.fb.group({
      role: [""],
      specialization: [null],
    });
  }

  readonly rolesMembersList = rolesMembersList;

  inviteForm: FormGroup;
  errorMessage = ErrorMessage;

  readonly invite = input.required<Invite>();

  readonly remove = output<number>();
  readonly edit = output<{ inviteId: number; role: string; specialization: string }>();

  ngOnInit(): void {
    if (this.invite()) {
      this.inviteForm.patchValue({
        role: this.invite().role,
        specialization: this.invite().specialization,
      });
    }
  }

  // Сигналы для управления состоянием модальных окон
  isRemoveInviteModal = signal(false);
  isEditInviteModal = signal(false);

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.invite()?.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.isEditInviteModal.set(false);

    this.edit.emit({
      inviteId: this.invite()?.id,
      role: this.inviteForm.value.role,
      specialization: this.inviteForm.value.specialization,
    });
  }
}
