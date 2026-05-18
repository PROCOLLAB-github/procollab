/** @format */

import { inject, Injectable } from "@angular/core";
import { GetNestedError } from "@api/skills/use-cases/get-skills-nested.use-case";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class GetSpecializationsNestedUseCase {
  private readonly specializationRepository = inject(SpecializationsRepositoryPort);

  execute(): Observable<Result<SpecializationsGroup[], GetNestedError>> {
    return this.specializationRepository.getSpecializationsNested().pipe(
      map(specs => ok<SpecializationsGroup[]>(specs)),
      catchError(error => of(fail<GetNestedError>({ kind: "server_error", cause: error } as const)))
    );
  }
}
