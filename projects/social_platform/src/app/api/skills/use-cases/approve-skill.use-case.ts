/** @format */

import { inject, Injectable } from "@angular/core";
import { fail, ok, Result } from "@domain/shared/result.type";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { Approve } from "@domain/skills/skill.model";
import { catchError, map, Observable, of } from "rxjs";

/** Сценарий: подтвердить навык пользователя; ошибка → `approve_skill_error`. */
@Injectable({ providedIn: "root" })
export class ApproveSkillUseCase {
  private readonly skillsRepository = inject(SkillsRepositoryPort);

  execute(
    userId: number,
    skillId: number,
  ): Observable<Result<Approve, { kind: "approve_skill_error"; cause?: unknown }>> {
    return this.skillsRepository.approveSkill(userId, skillId).pipe(
      map(approve => ok<Approve>(approve)),
      catchError(error => of(fail({ kind: "approve_skill_error", cause: error } as const))),
    );
  }
}
