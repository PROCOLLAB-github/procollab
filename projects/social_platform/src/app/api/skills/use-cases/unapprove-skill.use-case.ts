/** @format */

import { inject, Injectable } from "@angular/core";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { catchError, map, Observable, of } from "rxjs";

/** Сценарий: снять подтверждение навыка; ошибка → `unapprove_skill_error`. */
@Injectable({ providedIn: "root" })
export class UnapproveSkillUseCase {
  private readonly skillRepository = inject(SkillsRepositoryPort);

  execute(
    userId: number,
    skillId: number,
  ): Observable<Result<void, { kind: "unapprove_skill_error"; cause?: unknown }>> {
    return this.skillRepository.unapproveSkill(userId, skillId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "unapprove_skill_error", cause: error } as const))),
    );
  }
}
