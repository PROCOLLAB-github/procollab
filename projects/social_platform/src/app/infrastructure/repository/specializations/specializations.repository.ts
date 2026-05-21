/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Specialization } from "@domain/specializations/specialization.model";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { SpecializationsHttpAdapter } from "../../adapters/specializations/specializations-http.adapter";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";

/** Репозиторий специализаций: passthrough nested/inline в адаптер. */
@Injectable({ providedIn: "root" })
export class SpecializationsRepository implements SpecializationsRepositoryPort {
  private readonly specializationsAdapter = inject(SpecializationsHttpAdapter);

  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.specializationsAdapter
      .getSpecializationsNested()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>> {
    return this.specializationsAdapter.getSpecializationsInline(search, limit, offset);
  }
}
