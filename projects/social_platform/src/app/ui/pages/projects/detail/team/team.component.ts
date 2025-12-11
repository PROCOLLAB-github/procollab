/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { IconComponent } from "@uilib";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { filter, map, Subscription } from "rxjs";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ProjectDataService } from "projects/social_platform/src/app/api/project/project-data.service";

/**
 * Компонент страницы команды в деательной информации о проекте
 */
@Component({
  selector: "app-project-eam",
  templateUrl: "./team.component.html",
  styleUrl: "./team.component.scss",
  imports: [CommonModule, IconComponent, InfoCardComponent],
  standalone: true,
})
export class ProjectTeamComponent implements OnInit, OnDestroy {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // массив пользователей в команде
  readonly collaborators = this.projectDataService.collaborators;
  readonly projectId = this.projectDataService.projectId;
  loggedUserId = signal<number>(0);
  readonly leaderId = this.projectDataService.leaderId;

  // массив подписок
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (location.href.includes("/team")) {
      const currentProfileId$ = this.authService.profile
        .pipe(
          filter(profile => !!profile),
          map(profile => profile.id)
        )
        .subscribe({
          next: profileId => {
            if (profileId) {
              this.loggedUserId.set(profileId);
            }
          },
        });

      this.subscriptions.push(currentProfileId$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  removeCollaboratorFromProject(userId: number): void {
    if (!this.collaborators()) return;

    this.projectService.removeColloborator(this.projectId()!, userId).subscribe({
      next: () => {
        const updatedProject = {
          ...this.projectDataService.project()!,
          collaborators: this.collaborators()?.filter(c => c.userId !== userId) ?? [],
        };
        this.projectDataService.setProject(updatedProject);
      },
    });
  }
}
