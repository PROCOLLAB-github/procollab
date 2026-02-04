/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { ProjectsDetailService } from "projects/social_platform/src/app/api/project/facades/detail/projects-detail.service";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";

/**
 * Компонент страницы команды в деательной информации о проекте
 */
@Component({
  selector: "app-project-eam",
  templateUrl: "./team.component.html",
  styleUrl: "./team.component.scss",
  imports: [CommonModule, InfoCardComponent],
  standalone: true,
})
export class ProjectTeamComponent implements OnInit, OnDestroy {
  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  // массив пользователей в команде
  protected readonly collaborators = this.projectsDetailUIInfoService.collaborators;
  protected readonly projectId = this.projectsDetailUIInfoService.projectId;
  protected readonly loggedUserId = this.projectsDetailUIInfoService.loggedUserId;
  protected readonly leaderId = this.projectsDetailUIInfoService.leaderId;

  ngOnInit(): void {
    this.projectsDetailService.initializationTeam();
  }

  ngOnDestroy(): void {
    this.projectsDetailService.destroy();
  }

  removeCollaboratorFromProject(userId: number): void {
    this.projectsDetailService.removeCollaboratorFromProject(userId);
  }
}
