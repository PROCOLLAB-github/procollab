/** @format */

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "@corelib";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { SkillsGroup } from "../../domain/skills/skills-group";
import { Skill } from "../../domain/skills/skill";

/**
 * Сервис для работы с навыками пользователей
 *
 * Предоставляет функциональность для:
 * - Получения навыков в виде иерархической структуры (группы)
 * - Получения навыков в виде плоского списка с поиском и пагинацией
 * - Поиска навыков по названию
 */
@Injectable({
  providedIn: "root",
})
export class SkillsService {
  private readonly CORE_SKILLS_URL = "/core/skills";

  constructor(private apiService: ApiService) {}

  /**
   * Получает навыки в виде иерархической структуры (группы и подгруппы)
   * Используется для отображения в виде дерева или категорий навыков
   *
   * @returns Observable<SkillsGroup[]> - массив групп навыков с вложенными элементами
   */
  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.apiService.get(`${this.CORE_SKILLS_URL}/nested`);
  }

  /**
   * Получает навыки в виде плоского списка с поддержкой поиска и пагинации
   * Используется для автокомплита, выпадающих списков и поиска навыков
   *
   * @param search - строка поиска для фильтрации по названию навыка
   * @param limit - максимальное количество результатов на странице
   * @param offset - количество пропускаемых результатов (для пагинации)
   * @returns Observable<ApiPagination<Skill>> - объект с массивом навыков и метаданными пагинации
   */
  getSkillsInline(search: string, limit: number, offset: number): Observable<ApiPagination<Skill>> {
    return this.apiService.get(
      `${this.CORE_SKILLS_URL}/inline`,
      new HttpParams({ fromObject: { limit, offset, name__icontains: search } })
    );
  }
}
