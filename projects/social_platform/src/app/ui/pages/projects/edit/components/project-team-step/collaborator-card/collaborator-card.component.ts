/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../../../../ui/src/lib/services/desktop-layout.service";

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
import { IconComponent, ButtonDirective, StateComponent } from "@uilib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";

@Component({
  selector: "app-collaborator-card",
  templateUrl: "./collaborator-card.component.html",
  styleUrl: "./collaborator-card.component.scss",
  imports: [StateComponent, ButtonDirective, AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorCardComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  private readonly removeProjectCollaboratorUseCase = inject(RemoveProjectCollaboratorUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly collaborator = input.required<Collaborator>();
  readonly isCurrentUser = input(false);
  readonly isLeader = input(false);
  readonly collaboratorRemoved = output<number>();
  readonly removing = signal(false);
  readonly error = signal("");

  onDeleteCollaborator(collaboratorId: number): void {
    if (this.removing()) return;
    const projectId = this.route.snapshot.params["projectId"];
    if (!confirm("Вы точно хотите удалить участника проекта?")) return;
    this.removing.set(true);
    this.error.set("");
    this.removeProjectCollaboratorUseCase
      .execute(+projectId, collaboratorId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.removing.set(false)),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.error.set("Не удалось исключить участника. Попробуйте ещё раз.");
            return;
          }
          this.collaboratorRemoved.emit(result.value);
        },
      });
  }
}
