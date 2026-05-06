/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SkillsGroup } from "@domain/skills/skills-group";

export type GetSkillsNestedError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class GetSkillsNestedUseCase {
  private readonly skillsRepository = inject(SkillsRepositoryPort);

  execute(): Observable<Result<SkillsGroup[], GetSkillsNestedError>> {
    return this.skillsRepository.getSkillsNested().pipe(
      map(groups => ok<SkillsGroup[]>(groups)),
      catchError(() => of(fail<GetSkillsNestedError>({ kind: "server_error" })))
    );
  }
}
