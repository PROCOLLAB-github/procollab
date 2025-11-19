/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { IconComponent } from "@uilib";
import { ProjectDataService } from "../services/project-data.service";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";
import { Subscription } from "rxjs";
import { Project } from "@office/models/project.model";
import { ProjectService } from "@office/services/project.service";
import { AuthService } from "@auth/services";

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
  team?: Project["collaborators"];
  projectId = signal<number>(0);
  loggedUserId = signal<number>(0);
  leaderId = signal<number>(0);

  // массив подписок
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // получение данных из сервиса как потока данных и подписка на них
    const teamSub$ = this.projectDataService.getTeam().subscribe({
      next: team => {
        this.team = team;
      },
    });

    teamSub$ && this.subscriptions.push(teamSub$);

    const projectId$ = this.projectDataService.getProjectId().subscribe({
      next: projectId => {
        if (projectId) {
          this.projectId.set(projectId);
        }
      },
    });

    if (location.href.includes("/team")) {
      const leaderId$ = this.projectDataService.getProjectLeaderId().subscribe({
        next: leaderId => {
          if (leaderId) {
            this.leaderId.set(leaderId);
          }
        },
      });

      const currentProfileId$ = this.authService.profile.subscribe({
        next: profile => {
          if (profile) {
            this.loggedUserId.set(profile.id);
          }
        },
      });

      this.subscriptions.push(leaderId$, currentProfileId$);
    }

    this.subscriptions.push(projectId$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  removeCollaboratorFromProject(userId: number): void {
    const index = this.team?.findIndex(p => p.userId === userId);
    if (index !== -1) {
      this.team?.splice(index!, 1);
    }

    this.projectService.removeColloborator(this.projectId(), userId).subscribe();
  }
}
