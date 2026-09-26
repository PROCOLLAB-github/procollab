/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberHttpAdapter } from "../../adapters/member/member-http.adapter";
import { userFromRaw } from "@utils/userRaw";
import { MemberStatistics } from "@domain/member/member-statistics.model";

/** Преобразует участников в domain-модель и проверяет контракт глобальных счётчиков. */
@Injectable({ providedIn: "root" })
export class MemberRepository implements MemberRepositoryPort {
  private readonly memberAdapter = inject(MemberHttpAdapter);

  /** Не превращает неполный или некорректный контракт в ложные нулевые показатели. */
  getStatistics(): Observable<MemberStatistics> {
    return this.memberAdapter.getStatistics().pipe(
      map(data => {
        const values = [data?.total, data?.inProjects, data?.inPrograms, data?.newLast30Days];
        if (values.some(value => !Number.isSafeInteger(value) || value < 0)) {
          throw new Error("Некорректный ответ статистики участников");
        }
        return data;
      }),
    );
  }

  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>,
  ): Observable<ApiPagination<User>> {
    return this.memberAdapter.getMembers(skip, take, otherParams).pipe(
      map(result => ({
        ...result,
        results: result.results.map(user => userFromRaw(user)),
      })),
    );
  }
}
