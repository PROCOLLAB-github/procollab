/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { Skill } from "@domain/skills/skill";
import { ApiPagination } from "@domain/other/api-pagination.model";

export type SearchSkillsError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class SearchSkillsUseCase {
  private readonly skillsRepository = inject(SkillsRepositoryPort);

  execute(
    search: string,
    limit: number,
    offset: number
  ): Observable<Result<ApiPagination<Skill>, SearchSkillsError>> {
    return this.skillsRepository.getSkillsInline(search, limit, offset).pipe(
      map(page => ok<ApiPagination<Skill>>(page)),
      catchError(() => of(fail<SearchSkillsError>({ kind: "server_error" })))
    );
  }
}
