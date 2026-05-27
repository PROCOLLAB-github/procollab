/** @format */

import { Observable } from "rxjs";
import { Specialization } from "../specialization.model";
import { SpecializationsGroup } from "../specializations-group.model";
import { ApiPagination } from "../../other/api-pagination.model";

/** Порт репозитория специализаций */
export abstract class SpecializationsRepositoryPort {
  abstract getSpecializationsNested(): Observable<SpecializationsGroup[]>;
  abstract getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>>;
}
