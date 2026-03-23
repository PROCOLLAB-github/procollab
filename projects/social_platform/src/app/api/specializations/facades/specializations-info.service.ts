/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Specialization } from "@domain/specializations/specialization";
import { SpecializationsGroup } from "@domain/specializations/specializations-group";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";

@Injectable({ providedIn: "root" })
export class SpecializationsInfoService {
  private readonly specializationsRepository = inject(SpecializationsRepositoryPort);

  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.specializationsRepository.getSpecializationsNested();
  }

  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>> {
    return this.specializationsRepository.getSpecializationsInline(search, limit, offset);
  }
}
