/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AsyncState, failure, loading, success } from "@domain/shared/async-state";
import { MemberStatistics } from "@domain/member/member-statistics.model";
import { GetMemberStatisticsUseCase } from "../use-cases/get-member-statistics.use-case";

/** Состояние статистики живёт вместе со страницей, отдельно от поисковой выдачи. */
@Injectable()
export class MemberStatisticsFacade {
  private readonly getStatistics = inject(GetMemberStatisticsUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly current = signal<AsyncState<MemberStatistics>>(loading());
  readonly state = this.current.asReadonly();
  private started = false;

  /** Один запрос на открытие страницы; фильтры и смена layout не запускают его повторно. */
  load(): void {
    if (this.started) return;
    this.started = true;
    this.getStatistics
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.current.set(result.ok ? success(result.value) : failure(result.error));
      });
  }
}
