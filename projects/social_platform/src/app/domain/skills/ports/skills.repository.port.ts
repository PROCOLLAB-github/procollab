/** @format */

import { Observable } from "rxjs";
import { Skill } from "../skill";
import { SkillsGroup } from "../skills-group";
import { ApiPagination } from "../../other/api-pagination.model";

/**
 * Порт репозитория навыков.
 * Реализуется в infrastructure/repository/skills/skills.repository.ts
 */
export abstract class SkillsRepositoryPort {
  abstract getSkillsNested(): Observable<SkillsGroup[]>;
  abstract getSkillsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Skill>>;
}
