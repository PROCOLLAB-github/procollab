/** @format */

import { Component, EventEmitter, Input, OnInit, Output, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { Invite } from "@models/invite.model";
import { IconComponent, ButtonComponent, SelectComponent, InputComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { rolesMembersList } from "projects/core/src/consts/list-roles-members";

@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrl: "./invite-card.component.scss",
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    ModalComponent,
    SelectComponent,
    ControlErrorPipe,
    ReactiveFormsModule,
    InputComponent,
  ],
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

  @Input({ required: true }) invite!: Invite;
  @Input() type: "team" | "members" = "members";

  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<{ inviteId: number; role: string; specialization: string }>();

  ngOnInit(): void {
    if (this.invite) {
      this.inviteForm.patchValue({
        role: this.invite.role,
        specialization: this.invite.specialization,
      });
    }
  }

  isRemoveInviteModal = signal(false);
  isEditInviteModal = signal(false);

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.invite?.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.isEditInviteModal.set(false);

    this.edit.emit({
      inviteId: this.invite?.id,
      role: this.inviteForm.value.role,
      specialization: this.inviteForm.value.specialization,
    });
  }
}
