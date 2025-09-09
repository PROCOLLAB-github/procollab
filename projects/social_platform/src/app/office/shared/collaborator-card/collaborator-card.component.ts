/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ErrorMessage } from "@error/models/error-message";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectService } from "@office/services/project.service";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { IconComponent } from "@uilib";

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
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, IconComponent],
})
export class CollaboratorCardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.inviteForm = this.fb.group({
      role: [""],
      specializations: this.fb.array([]),
    });
  }

  inviteForm: FormGroup;
  errorMessage = ErrorMessage;

  @Input({ required: true }) collaborator!: Collaborator;
  @Output() collaboratorRemoved = new EventEmitter<number>();

  ngOnInit(): void {
    if (this.collaborator) {
      this.inviteForm.patchValue({
        role: this.collaborator.role,
        specialization: this.collaborator.skills,
      });
    }
  }

  onDeleteCollaborator(collaboratorId: number): void {
    const projectId = this.route.snapshot.params["projectId"];

    if (!confirm("Вы точно хотите удалить участника проекта?")) return;

    this.projectService.removeColloborator(+projectId, collaboratorId).subscribe({
      next: () => {
        this.collaboratorRemoved.emit(collaboratorId);
      },
    });
  }
}
