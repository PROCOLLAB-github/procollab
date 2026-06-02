/** @format */

import { Observable } from "rxjs";
import { Approve, Skill } from "../skill.model";
import { SkillsGroup } from "../skills-group.model";
import { ApiPagination } from "../../other/api-pagination.model";

/** Порт репозитория навыков */
export abstract class SkillsRepositoryPort {
  abstract getSkillsNested(): Observable<SkillsGroup[]>;
  abstract getSkillsInline(
    search: string,
    limit: number,
    offset: number,
  ): Observable<ApiPagination<Skill>>;
  abstract approveSkill(userId: number, skillId: number): Observable<Approve>;
  abstract unapproveSkill(userId: number, skillId: number): Observable<void>;
}
