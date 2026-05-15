/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SkillsGroup } from "@domain/skills/skills-group.model";

export type GetNestedError = { kind: "server_error"; cause?: unknown };

@Injectable({ providedIn: "root" })
export class GetSkillsNestedUseCase {
  private readonly skillsRepository = inject(SkillsRepositoryPort);

  execute(): Observable<Result<SkillsGroup[], GetNestedError>> {
    return this.skillsRepository.getSkillsNested().pipe(
      map(groups => ok<SkillsGroup[]>(groups)),
      catchError(error => of(fail<GetNestedError>({ kind: "server_error", cause: error })))
    );
  }
}
