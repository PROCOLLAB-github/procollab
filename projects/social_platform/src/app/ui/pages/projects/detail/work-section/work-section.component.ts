/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { ProjectsDetailWorkSectionInfoService } from "projects/social_platform/src/app/api/project/facades/detail/work-section/projects-detail-work-section-info.service";
import { ProjectsDetailWorkSectionUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/work-section/ui/projects-detail-work-section-ui-info.service";

@Component({
  selector: "app-work-section",
  templateUrl: "./work-section.component.html",
  styleUrl: "./work-section.component.scss",
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  providers: [ProjectsDetailWorkSectionInfoService, ProjectsDetailWorkSectionUIInfoService],
  standalone: true,
})
export class ProjectWorkSectionComponent implements OnInit, OnDestroy {
  private readonly projectsDetailWorkSectionInfoService = inject(
    ProjectsDetailWorkSectionInfoService
  );

  private readonly projectsDetailWorkSectionUIInfoService = inject(
    ProjectsDetailWorkSectionUIInfoService
  );

  protected readonly vacancies = this.projectsDetailWorkSectionUIInfoService.vacancies;
  protected readonly projectId = this.projectsDetailWorkSectionInfoService.projectId;

  ngOnInit(): void {
    this.projectsDetailWorkSectionInfoService.initializationWorkSection();
  }

  ngOnDestroy(): void {
    this.projectsDetailWorkSectionInfoService.destroy();
  }

  /**
   * Принятие отклика на вакансию
   * @param responseId - ID отклика для принятия
   */
  acceptResponse(responseId: number) {
    this.projectsDetailWorkSectionInfoService.acceptResponse(responseId);
  }

  /**
   * Отклонение отклика на вакансию
   * @param responseId - ID отклика для отклонения
   */
  rejectResponse(responseId: number) {
    this.projectsDetailWorkSectionInfoService.rejectResponse(responseId);
  }
}
