/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { Collaborator } from "@office/models/collaborator.model";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

/**
 * Компонент карточки участника команды или проект
 *
 * Функциональность:
 * - Отображает информацию о участнике (роль, специализация)
 *
 * Входные параметры:
 * @Input invite - объект участника (обязательный)
 */
@Component({
  selector: "app-collaborator-card",
  templateUrl: "./collaborator-card.component.html",
  styleUrl: "./collaborator-card.component.scss",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent],
})
export class CollaboratorCardComponent implements OnInit {
  constructor(private readonly fb: FormBuilder) {
    this.inviteForm = this.fb.group({
      role: [""],
      specializations: this.fb.array([]),
    });
  }

  inviteForm: FormGroup;
  errorMessage = ErrorMessage;

  @Input({ required: true }) collaborator!: Collaborator;

  ngOnInit(): void {
    if (this.collaborator) {
      this.inviteForm.patchValue({
        role: this.collaborator.role,
        specialization: this.collaborator.skills,
      });
    }
  }
}
