/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { map, Subject, takeUntil } from "rxjs";
import { VacancyService } from "../../../../vacancy/vacancy.service";
import { ActivatedRoute } from "@angular/router";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { ProjectsDetailWorkSectionUIInfoService } from "./ui/projects-detail-work-section-ui-info.service";

@Injectable()
export class ProjectsDetailWorkSectionInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly projectsDetailWorkSectionUIInfoService = inject(
    ProjectsDetailWorkSectionUIInfoService
  );

  private readonly destroy$ = new Subject<void>();

  readonly projectId = signal<number | undefined>(undefined);

  initializationWorkSection(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (responses: VacancyResponse[]) => {
          this.projectsDetailWorkSectionUIInfoService.applyInitVacancies(responses);
        },
      });

    this.projectId.set(this.route.parent?.snapshot.params["projectId"]);
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Принятие отклика на вакансию
   * @param responseId - ID отклика для принятия
   */
  acceptResponse(responseId: number) {
    this.vacancyService
      .acceptResponse(responseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }

  /**
   * Отклонение отклика на вакансию
   * @param responseId - ID отклика для отклонения
   */
  rejectResponse(responseId: number) {
    this.vacancyService
      .rejectResponse(responseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }
}
