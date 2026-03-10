/** @format */

import { Observable } from "rxjs";
import { Specialization } from "../specialization";
import { SpecializationsGroup } from "../specializations-group";
import { ApiPagination } from "../../other/api-pagination.model";

/**
 * Порт репозитория специализаций.
 * Реализуется в infrastructure/repository/specializations/specializations.repository.ts
 */
export abstract class SpecializationsRepositoryPort {
  abstract getSpecializationsNested(): Observable<SpecializationsGroup[]>;
  abstract getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>>;
}
