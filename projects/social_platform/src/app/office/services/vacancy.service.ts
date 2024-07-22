/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { map, Observable } from "rxjs";
import { Vacancy } from "@models/vacancy.model";
import { plainToInstance } from "class-transformer";
import { VacancyResponse } from "@models/vacancy-response.model";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@office/models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  constructor(private readonly apiService: ApiService) { }

  getForProject(offset: number, limit: number, projectId?: number): Observable<Vacancy[]> {
    const params = new HttpParams()

    params.set('limit', limit);
    params.set('offset', offset);

    if (projectId) {
      params.set('project_id', projectId);
    }

    return this.apiService
      .get<Vacancy[]>("/vacancies/", params)
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));
  }

  getMyVacancies(offset: number, limit: number): Observable<Vacancy[]> {
    const params = new HttpParams()

    params.set('limit', limit);
    params.set('offset', offset);

    // if (projectId) {
    //   params.set('project_id', projectId);
    // }
    
    return this.apiService
      .get<Vacancy[]>("/vacancies/", params)
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));
  }

  postVacancy(
    projectId: number,
    vacancy: { role: string; requiredSkillsIds: number[] }
  ): Observable<Vacancy> {
    return this.apiService
      .post("/vacancies/", {
        ...vacancy,
        project: projectId,
      })
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`/vacancies/${vacancyId}`);
  }

  sendResponse(vacancyId: number, body: { whyMe: string }): Observable<void> {
    return this.apiService.post(`/vacancies/${vacancyId}/responses/`, body);
  }

  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.apiService
      .get<VacancyResponse[]>(`/projects/${projectId}/responses/`)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  acceptResponse(responseId: number): Observable<void> {
    return this.apiService.post(`/vacancies/responses/${responseId}/accept/`, {});
  }

  rejectResponse(responseId: number): Observable<void> {
    return this.apiService.post(`/vacancies/responses/${responseId}/decline/`, {});
  }
}
