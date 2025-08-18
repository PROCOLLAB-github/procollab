/** @format */

import { Injectable } from "@angular/core";
import { SpecializationsGroup } from "../models/specializations-group";
import { Observable } from "rxjs";
import { ApiService } from "@corelib";
import { Specialization } from "../models/specialization";
import { ApiPagination } from "@office/models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

/**
 * Сервис для работы со специализациями пользователей
 *
 * Предоставляет функциональность для:
 * - Получения специализаций в виде иерархической структуры (группы)
 * - Получения специализаций в виде плоского списка с поиском и пагинацией
 * - Поиска специализаций по названию
 */
@Injectable({
  providedIn: "root",
})
export class SpecializationsService {
  private readonly AUTH_USERS_SPECIALIZATIONS_URL = "/auth/users/specializations";

  constructor(private apiService: ApiService) {}

  /**
   * Получает специализации в виде иерархической структуры (группы и подгруппы)
   * Используется для отображения в виде дерева или категорий
   *
   * @returns Observable<SpecializationsGroup[]> - массив групп специализаций с вложенными элементами
   */
  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.apiService.get(`${this.AUTH_USERS_SPECIALIZATIONS_URL}/nested`);
  }

  /**
   * Получает специализации в виде плоского списка с поддержкой поиска и пагинации
   * Используется для автокомплита, выпадающих списков и поиска
   *
   * @param search - строка поиска для фильтрации по названию специализации
   * @param limit - максимальное количество результатов на странице
   * @param offset - количество пропускаемых результатов (для пагинации)
   * @returns Observable<ApiPagination<Specialization>> - объект с массивом специализаций и метаданными пагинации
   */
  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>> {
    return this.apiService.get(
      `${this.AUTH_USERS_SPECIALIZATIONS_URL}/inline`,
      new HttpParams({ fromObject: { limit, offset, name__icontains: search } })
    );
  }
}
