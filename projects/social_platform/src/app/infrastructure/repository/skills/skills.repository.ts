/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Skill } from "@domain/skills/skill";
import { SkillsGroup } from "@domain/skills/skills-group";
import { SkillsHttpAdapter } from "../../adapters/skills/skills-http.adapter";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";

@Injectable({ providedIn: "root" })
export class SkillsRepository implements SkillsRepositoryPort {
  private readonly skillsAdapter = inject(SkillsHttpAdapter);

  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.skillsAdapter.getSkillsNested();
  }

  getSkillsInline(search: string, limit: number, offset: number): Observable<ApiPagination<Skill>> {
    return this.skillsAdapter.getSkillsInline(search, limit, offset);
  }
}
