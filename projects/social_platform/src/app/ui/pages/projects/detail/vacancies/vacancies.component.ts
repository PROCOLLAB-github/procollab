/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ProjectVacancyCardComponent } from "../../../../shared/project-vacancy-card/project-vacancy-card.component";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectsDetailService } from "projects/social_platform/src/app/api/project/facades/detail/projects-detail.service";

/**
 * Компонент страницы вакансий в деательной информации о проекте
 */
@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
  imports: [CommonModule, ProjectVacancyCardComponent],
  standalone: true,
})
export class ProjectVacanciesComponent implements OnInit, OnDestroy {
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly projectsDetailService = inject(ProjectsDetailService);

  // массив пользователей в команде
  protected readonly vacancies = this.projectsDetailUIInfoService.vacancies;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.projectsDetailService.destroy();
  }
}
