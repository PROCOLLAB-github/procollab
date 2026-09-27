/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { User } from "../../auth/user.model";
import { MemberStatistics } from "../member-statistics.model";

/** Порт каталога: фильтруемый список и отдельная глобальная статистика участников. */
export abstract class MemberRepositoryPort {
  /** Получает агрегаты без параметров поиска и пагинации. */
  abstract getStatistics(): Observable<MemberStatistics>;

  abstract getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>,
  ): Observable<ApiPagination<User>>;
}
