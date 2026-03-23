/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { map, Subject, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { ProjectsDetailWorkSectionUIInfoService } from "./ui/projects-detail-work-section-ui-info.service";
import { AcceptResponseUseCase } from "../../../../vacancy/use-cases/accept-response.use-case";
import { RejectResponseUseCase } from "../../../../vacancy/use-cases/reject-response.use-case";

@Injectable()
export class ProjectsDetailWorkSectionInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly acceptResponseUseCase = inject(AcceptResponseUseCase);
  private readonly rejectResponseUseCase = inject(RejectResponseUseCase);
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
    this.acceptResponseUseCase
      .execute(responseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }

  /**
   * Отклонение отклика на вакансию
   * @param responseId - ID отклика для отклонения
   */
  rejectResponse(responseId: number) {
    this.rejectResponseUseCase
      .execute(responseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }
}
