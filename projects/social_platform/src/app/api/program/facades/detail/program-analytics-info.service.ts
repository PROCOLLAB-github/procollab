/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import {
  ProgramAnalyticsError,
  ProgramAnalyticsOverview,
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
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

/** Состояние и загрузка внутренней вкладки аналитики программы. */
@Injectable()
export class ProgramAnalyticsInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getOverview = inject(GetProgramManagerOverviewUseCase);
  private readonly programUI = inject(ProgramDetailMainUIInfoService);

  readonly state = signal<AsyncState<ProgramAnalyticsOverview, ProgramAnalyticsError>>(initial());
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
    this.getOverview
      .execute(programId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.state.set(failure(this.mapError(result.error.status)));
          return;
        }

        this.state.set(success(result.value));
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
