/** @format */

import { inject, Injectable } from "@angular/core";
import { GetNestedError } from "@api/skills/use-cases/get-skills-nested.use-case";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { Specialization } from "@domain/specializations/specialization.model";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class GetSpecializationsInlineUseCase {
  private readonly specializationRepository = inject(SpecializationsRepositoryPort);

  execute(
    search: string,
    limit: number,
    offset: number
  ): Observable<Result<ApiPagination<Specialization>, GetNestedError>> {
    return this.specializationRepository.getSpecializationsInline(search, limit, offset).pipe(
      map(specs => ok<ApiPagination<Specialization>>(specs)),
      catchError(error => of(fail({ kind: "server_error", cause: error } as const)))
    );
  }
}
