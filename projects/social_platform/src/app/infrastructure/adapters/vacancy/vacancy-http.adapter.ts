/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { map, Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { CreateVacancyDto } from "@domain/vacancy/dto/create-vacancy.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

/** HTTP-адаптер вакансий: `/vacancies`, `/projects` (поиск, CRUD, отклики, accept/reject). */
@Injectable({ providedIn: "root" })
export class VacancyHttpAdapter {
  private readonly VACANCIES_URL = "/vacancies";
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  getForProject(
    limit: number,
    offset: number,
    projectId?: number,
    requiredExperience?: string,
    workFormat?: string,
    workSchedule?: string,
    salary?: string,
    searchValue?: string,
  ): Observable<ApiPagination<Vacancy>> {
    let params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());

    if (projectId !== undefined) params = params.set("project_id", projectId.toString());
    if (requiredExperience) params = params.set("required_experience", requiredExperience);
    if (workFormat) params = params.set("work_format", workFormat);
    if (workSchedule) params = params.set("work_schedule", workSchedule);
    if (salary) params = params.set("salary", salary);
    if (searchValue) params = params.set("role_contains", searchValue);

    return this.apiService.get<ApiPagination<Vacancy>>(`${this.VACANCIES_URL}/`, params);
  }

  getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]> {
    const params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());
    return this.apiService.get<VacancyResponse[]>(`${this.VACANCIES_URL}/responses/self/`, params);
  }

  getOne(vacancyId: number): Observable<Vacancy> {
    return this.apiService.get<Vacancy>(`${this.VACANCIES_URL}/${vacancyId}/`);
  }

  postVacancy(projectId: number, vacancy: CreateVacancyDto): Observable<Vacancy> {
    return this.apiService.post<Vacancy>(`${this.VACANCIES_URL}/`, {
      ...vacancy,
      project: projectId,
    });
  }

  updateVacancy(
    vacancyId: number,
    vacancy: Partial<Vacancy> | CreateVacancyDto,
  ): Observable<Vacancy> {
    return this.apiService.patch<Vacancy>(`${this.VACANCIES_URL}/${vacancyId}/`, { ...vacancy });
  }

  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`${this.VACANCIES_URL}/${vacancyId}/`);
  }

  sendResponse(vacancyId: number, body: { whyMe: string }): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/${vacancyId}/responses/`,
      body,
    );
  }

  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.apiService.get<VacancyResponse[]>(`${this.PROJECTS_URL}/${projectId}/responses/`);
  }

  acceptResponse(responseId: number): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/responses/${responseId}/accept/`,
      {},
    );
  }

  rejectResponse(responseId: number): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/responses/${responseId}/decline/`,
      {},
    );
  }
}
