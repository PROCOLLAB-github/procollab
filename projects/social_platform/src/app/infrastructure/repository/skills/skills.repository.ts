/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Approve, Skill } from "@domain/skills/skill.model";
import { SkillsGroup } from "@domain/skills/skills-group.model";
import { SkillsHttpAdapter } from "../../adapters/skills/skills-http.adapter";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";

@Injectable({ providedIn: "root" })
export class SkillsRepository implements SkillsRepositoryPort {
  private readonly skillsAdapter = inject(SkillsHttpAdapter);

  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.skillsAdapter
      .getSkillsNested()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getSkillsInline(search: string, limit: number, offset: number): Observable<ApiPagination<Skill>> {
    return this.skillsAdapter.getSkillsInline(search, limit, offset);
  }

  approveSkill(userId: number, skillId: number): Observable<Approve> {
    return this.skillsAdapter.approveSkill(userId, skillId);
  }

  unapproveSkill(userId: number, skillId: number): Observable<void> {
    return this.skillsAdapter.unapproveSkill(userId, skillId);
  }
}
