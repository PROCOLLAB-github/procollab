/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { SkillsGroup } from "@domain/skills/skills-group";
import { Skill } from "@domain/skills/skill";

@Injectable({ providedIn: "root" })
export class SkillsHttpAdapter {
  private readonly CORE_SKILLS_URL = "/core/skills";
  private readonly apiService = inject(ApiService);

  /**
   * Получает навыки в виде иерархической структуры (группы и подгруппы).
   */
  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.apiService.get(`${this.CORE_SKILLS_URL}/nested`);
  }

  /**
   * Получает навыки в виде плоского списка с поиском и пагинацией.
   *
   * @param search строка поиска
   * @param limit максимальное количество результатов
   * @param offset смещение
   */
  getSkillsInline(search: string, limit: number, offset: number): Observable<ApiPagination<Skill>> {
    return this.apiService.get(
      `${this.CORE_SKILLS_URL}/inline`,
      new HttpParams({ fromObject: { limit, offset, name__icontains: search } })
    );
  }
}
