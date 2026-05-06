/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Specialization } from "@domain/specializations/specialization";
import { SpecializationsGroup } from "@domain/specializations/specializations-group";
import { SpecializationsHttpAdapter } from "../../adapters/specializations/specializations-http.adapter";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";

@Injectable({ providedIn: "root" })
export class SpecializationsRepository implements SpecializationsRepositoryPort {
  private readonly specializationsAdapter = inject(SpecializationsHttpAdapter);

  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.specializationsAdapter.getSpecializationsNested();
  }

  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>> {
    return this.specializationsAdapter.getSpecializationsInline(search, limit, offset);
  }
}
