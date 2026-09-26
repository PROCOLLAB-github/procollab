/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { MemberStatistics } from "@domain/member/member-statistics.model";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Сценарий чтения четырёх агрегатов с безопасной ошибкой для UI. */
@Injectable({ providedIn: "root" })
export class GetMemberStatisticsUseCase {
  private readonly repository = inject(MemberRepositoryPort);

  /** Ошибка запроса/контракта остаётся ошибкой, а не набором нулей. */
  execute(): Observable<Result<MemberStatistics, "member_statistics_error">> {
    return this.repository.getStatistics().pipe(
      map(data => ok(data)),
      catchError(() => of(fail("member_statistics_error" as const))),
    );
  }
}
