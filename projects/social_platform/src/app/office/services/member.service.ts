/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

/**
 * Сервис для работы с участниками платформы
 *
 * Предоставляет функциональность для:
 * - Получения списка участников с пагинацией и фильтрацией
 * - Получения списка менторов
 * - Поиска пользователей по различным критериям
 * - Работы с публичными профилями пользователей
 */
@Injectable({
  providedIn: "root",
})
export class MemberService {
  private readonly AUTH_PUBLIC_USERS_URL = "/auth/public-users";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список участников платформы с пагинацией и дополнительными фильтрами
   * По умолчанию получает только обычных пользователей (user_type: 1)
   *
   * @param skip - количество пропускаемых записей (offset для пагинации)
   * @param take - максимальное количество записей на странице (limit)
   * @param otherParams - дополнительные параметры фильтрации (навыки, специализации, опыт и т.д.)
   * @returns Observable<ApiPagination<User>> - объект с массивом пользователей и метаданными пагинации
   */
  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<ApiPagination<User>> {
    let allParams = new HttpParams({ fromObject: { user_type: 1, limit: take, offset: skip } });
    if (otherParams) {
      allParams = allParams.appendAll(otherParams);
    }
    return this.apiService.get<ApiPagination<User>>(`${this.AUTH_PUBLIC_USERS_URL}/`, allParams);
  }

  /**
   * Получает список менторов и экспертов платформы
   * Включает пользователей с типами 2, 3, 4 (менторы, эксперты, консультанты)
   *
   * @param skip - количество пропускаемых записей (offset для пагинации)
   * @param take - максимальное количество записей на странице (limit)
   * @returns Observable<ApiPagination<User>> - объект с массивом менторов и метаданными пагинации
   */
  getMentors(skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get<ApiPagination<User>>(
      `${this.AUTH_PUBLIC_USERS_URL}/`,
      new HttpParams({ fromObject: { user_type: "2,3,4", limit: take, offset: skip } })
    );
  }
}
