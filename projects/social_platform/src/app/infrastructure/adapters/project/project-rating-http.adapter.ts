/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProjectRate } from "../../../domain/project/project-rate";
import { ProjectRatingCriterionOutput } from "../../../domain/project/project-rating-criterion-output";

@Injectable({ providedIn: "root" })
export class ProjectRatingHttpAdapter {
  private readonly RATE_PROJECT_URL = "/rate-project";
  private readonly apiService = inject(ApiService);

  /**
   * Получает список проектов программы для оценки.
   *
   * @param programId идентификатор программы
   * @param params query-параметры пагинации/фильтрации
   */
  getAll(programId: number, params?: HttpParams): Observable<ApiPagination<ProjectRate>> {
    return this.apiService.get(`${this.RATE_PROJECT_URL}/${programId}`, params);
  }

  /**
   * Получает список проектов программы с фильтрами.
   *
   * @param programId идентификатор программы
   * @param filters фильтры
   * @param params query-параметры пагинации/дополнительной фильтрации
   */
  postFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<ProjectRate>> {
    let url = `${this.RATE_PROJECT_URL}/${programId}`;
    if (params) {
      url += `?${params.toString()}`;
    }
    return this.apiService.post(url, { filters });
  }

  /**
   * Отправляет оценки по критериям для проекта.
   *
   * @param projectId идентификатор проекта
   * @param scores массив оценок критериев
   */
  rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<void> {
    return this.apiService.post(`${this.RATE_PROJECT_URL}/rate/${projectId}`, scores);
  }
}
