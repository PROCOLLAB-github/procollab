/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { Specialization } from "../../../domain/specializations/specialization";
import { SpecializationsGroup } from "../../../domain/specializations/specializations-group";

@Injectable({ providedIn: "root" })
export class SpecializationsHttpAdapter {
  private readonly AUTH_USERS_SPECIALIZATIONS_URL = "/auth/users/specializations";
  private readonly apiService = inject(ApiService);

  /**
   * Получает специализации в виде иерархической структуры (группы и подгруппы).
   */
  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.apiService.get(`${this.AUTH_USERS_SPECIALIZATIONS_URL}/nested`);
  }

  /**
   * Получает специализации в виде плоского списка с поддержкой поиска и пагинации.
   *
   * @param search строка поиска
   * @param limit максимальное количество результатов
   * @param offset смещение
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
