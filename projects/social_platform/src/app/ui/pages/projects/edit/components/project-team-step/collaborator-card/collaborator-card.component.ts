/** @format */
import { teamOperationErrorMessage } from "@api/project/team-operation-error";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Collaborator } from "@domain/project/collaborator.model";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { IconComponent } from "@uilib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";

@Component({
  selector: "app-collaborator-card",
  templateUrl: "./collaborator-card.component.html",
  styleUrl: "./collaborator-card.component.scss",
  imports: [AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorCardComponent {
  private readonly removeProjectCollaboratorUseCase = inject(RemoveProjectCollaboratorUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly collaborator = input.required<Collaborator>();
  readonly isCurrentUser = input(false);
  readonly frozen = input(false);
  readonly programLinkId = input<number>();
  readonly isLeader = input(false);
  readonly collaboratorRemoved = output<number>();
  readonly removing = signal(false);
  readonly error = signal("");

  onDeleteCollaborator(collaboratorId: number): void {
    if (this.removing() || this.frozen() || this.isLeader()) return;
    const projectId = this.route.snapshot.params["projectId"];
    if (!confirm("Вы точно хотите удалить участника проекта?")) return;
    this.removing.set(true);
    this.error.set("");
    this.removeProjectCollaboratorUseCase
      .execute(+projectId, collaboratorId, this.programLinkId())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.removing.set(false)),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.error.set(
              teamOperationErrorMessage(result.error.cause) ??
                "Не удалось исключить участника. Попробуйте ещё раз.",
            );
            return;
          }
          this.collaboratorRemoved.emit(result.value);
        },
      });
  }
}
