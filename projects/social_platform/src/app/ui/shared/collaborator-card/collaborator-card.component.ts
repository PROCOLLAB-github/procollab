/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { IconComponent } from "@uilib";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RemoveProjectCollaboratorUseCase } from "../../../api/project/use-case/remove-project-collaborator.use-case";

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
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, IconComponent, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorCardComponent implements OnInit {
  private readonly removeProjectCollaboratorUseCase = inject(RemoveProjectCollaboratorUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

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

    this.removeProjectCollaboratorUseCase
      .execute(+projectId, collaboratorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            return;
          }

          this.collaboratorRemoved.emit(result.value);
        },
      });
  }
}
