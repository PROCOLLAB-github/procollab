/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { map } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { ProjectsDetailWorkSectionUIInfoService } from "./ui/projects-detail-work-section-ui-info.service";
import { AcceptResponseUseCase } from "../../../../vacancy/use-cases/accept-response.use-case";
import { RejectResponseUseCase } from "../../../../vacancy/use-cases/reject-response.use-case";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад секции откликов проекта: принятие/отклонение отклика. */
@Injectable()
export class ProjectsDetailWorkSectionInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectsDetailWorkSectionUIInfoService = inject(
    ProjectsDetailWorkSectionUIInfoService
  );

  private readonly acceptResponseUseCase = inject(AcceptResponseUseCase);
  private readonly rejectResponseUseCase = inject(RejectResponseUseCase);


  readonly projectId = signal<number | undefined>(undefined);

  initializationWorkSection(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (responses: VacancyResponse[]) => {
          this.projectsDetailWorkSectionUIInfoService.applyInitVacancies(responses);
        },
      });

    this.projectId.set(this.route.parent?.snapshot.params["projectId"]);
  }

  acceptResponse(responseId: number) {
    this.acceptResponseUseCase
      .execute(responseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }

  rejectResponse(responseId: number) {
    this.rejectResponseUseCase
      .execute(responseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectsDetailWorkSectionUIInfoService.applyFilterVacacnies(responseId);
      });
  }
}
