/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { map, Observable } from "rxjs";
import { Vacancy } from "@models/vacancy.model";
import { plainToInstance } from "class-transformer";
import { VacancyResponse } from "@models/vacancy-response.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  constructor(private readonly apiService: ApiService) {}

  getForProject(
    limit: number,
    offset: number,
    projectId?: number,
    requiredExperience?: string,
    workFormat?: string,
    workSchedule?: string,
    salaryMin?: string,
    salaryMax?: string
  ): any {
    let params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());

    if (projectId !== undefined) {
      params = params.set("project_id", projectId.toString());
    }

    if (requiredExperience) {
      params = params.set("required_experience", requiredExperience);
    }

    if (workFormat) {
      params = params.set("work_format", workFormat);
    }

    if (workSchedule) {
      params = params.set("work_schedule", workSchedule);
    }

    if (salaryMin) {
      params = params.set("salary_min", salaryMin);
    }

    if (salaryMax) {
      params = params.set("salary_max", salaryMax);
    }

    return this.apiService
      .get<Vacancy[]>("/vacancies/", params)
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));
  }

  getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]> {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<VacancyResponse[]>("/vacancies/responses/self", params)
      .pipe(map(vacancies => plainToInstance(VacancyResponse, vacancies)));
  }

  getOne(vacancyId: number) {
    return this.apiService
      .get("/vacancies/" + vacancyId)
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  postVacancy(projectId: number, vacancy: Vacancy): Observable<Vacancy> {
    return this.apiService
      .post("/vacancies/", {
        ...vacancy,
        project: projectId,
      })
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  updateVacancy(vacancyId: number, vacancy: Vacancy) {
    return this.apiService.patch(`/vacancies/${vacancyId}`, { ...vacancy });
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
