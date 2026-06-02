/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRate } from "@domain/project/project-rate";
import { ProjectRatingCriterionOutput } from "@domain/project/project-rating-criterion-output";

/** HTTP-адаптер оценки проектов программы: `/rate-project` (список, фильтры, выставление оценок). */
@Injectable({ providedIn: "root" })
export class ProjectRatingHttpAdapter {
  private readonly RATE_PROJECT_URL = "/rate-project";
  private readonly apiService = inject(ApiService);

  getAll(programId: number, params?: HttpParams): Observable<ApiPagination<ProjectRate>> {
    return this.apiService.get(`${this.RATE_PROJECT_URL}/${programId}/`, params);
  }

  postFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams,
  ): Observable<ApiPagination<ProjectRate>> {
    let url = `${this.RATE_PROJECT_URL}/${programId}/`;
    if (params) {
      url += `?${params.toString()}`;
    }
    return this.apiService.post(url, { filters });
  }

  rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<void> {
    return this.apiService.post(`${this.RATE_PROJECT_URL}/rate/${projectId}/`, scores);
  }
}
