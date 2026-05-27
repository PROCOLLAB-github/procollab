/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { ProjectsDetailWorkSectionInfoService } from "@api/project/facades/detail/work-section/projects-detail-work-section-info.service";
import { ProjectsDetailWorkSectionUIInfoService } from "@api/project/facades/detail/work-section/ui/projects-detail-work-section-ui-info.service";

/** Секция откликов проекта: список и обработка откликов. */
@Component({
  selector: "app-work-section",
  templateUrl: "./work-section.component.html",
  styleUrl: "./work-section.component.scss",
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  providers: [ProjectsDetailWorkSectionInfoService, ProjectsDetailWorkSectionUIInfoService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  acceptResponse(responseId: number) {
    this.projectsDetailWorkSectionInfoService.acceptResponse(responseId);
  }

  rejectResponse(responseId: number) {
    this.projectsDetailWorkSectionInfoService.rejectResponse(responseId);
  }
}
