/** @format */

import { HttpParams } from "@angular/common/http";
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { GetAllProjectsUseCase } from "@api/program/use-cases/get-all-projects.use-case";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import {
  ProgramAnalyticsData,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";
import {
  AsyncState,
  failure,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";
import { forkJoin } from "rxjs";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

/** Состояние и загрузка внутренней вкладки аналитики программы. */
@Injectable()
export class ProgramAnalyticsInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getOverview = inject(GetProgramManagerOverviewUseCase);
  private readonly getProjects = inject(GetAllProjectsUseCase);
  private readonly programUI = inject(ProgramDetailMainUIInfoService);

  readonly state = signal<AsyncState<ProgramAnalyticsData, ProgramAnalyticsError>>(initial());
  readonly data = computed(() => {
    const state = this.state();
    return isSuccess(state) ? state.data : null;
  });
  readonly pending = computed(() => isLoading(this.state()));
  readonly failed = computed(() => isFailure(this.state()));
  readonly error = computed(() => {
    const state = this.state();
    return isFailure(state) ? state.error : null;
  });

  initialize(): void {
    const program = this.programUI.program();
    const programId = Number(this.route.parent?.snapshot.params["programId"]);

    if (!program?.isUserManager) {
      this.state.set(failure({ kind: "forbidden" }));
      return;
    }

    if (!Number.isInteger(programId) || programId <= 0) {
      this.state.set(failure({ kind: "not_found" }));
      return;
    }

    this.state.set(loading());

    forkJoin({
      overview: this.getOverview.execute(programId),
      projects: this.getProjects.execute(
        programId,
        new HttpParams({ fromObject: { limit: 1, offset: 0 } }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ overview, projects }) => {
        if (!overview.ok) {
          this.state.set(failure(this.mapError(overview.error.status)));
          return;
        }

        this.state.set(
          success({
            overview: overview.value,
            projectCount: projects.ok ? projects.value.count : null,
          }),
        );
      });
  }

  retry(): void {
    this.initialize();
  }

  private mapError(status: number): ProgramAnalyticsError {
    if (status === 401) return { kind: "unauthorized" };
    if (status === 403) return { kind: "forbidden" };
    if (status === 404) return { kind: "not_found" };
    return { kind: "network" };
  }
}
