/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { Vacancy } from "../models/vacancy.model";
import { plainToInstance } from "class-transformer";
import { VacancyResponse } from "../models/vacancy-response.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  constructor(private apiService: ApiService) {}

  getForProject(projectId: number): Observable<Vacancy[]> {
    return this.apiService
      .get<Vacancy[]>("/vacancies/", new HttpParams({ fromObject: { project_id: projectId } }))
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));
  }

  postVacancy(
    projectId: number,
    vacancy: { role: string; requirements: string[] }
  ): Observable<Vacancy> {
    return this.apiService
      .post("/vacancy/create", {
        ...vacancy,
        projectId,
        projectName: "",
        taken: false,
        description: "",
      })
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`/vacancy/${vacancyId}`);
  }

  sendResponse(vacancyId: number, body: { text: string }): Observable<void> {
    return this.apiService.post(`/response/send/${vacancyId}`, body);
  }

  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.apiService
      .get<VacancyResponse[]>(`/response/${projectId}`)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  acceptResponse(responseId: number): Observable<void> {
    return this.apiService.post(`/response/accept/${responseId}`, {});
  }

  rejectResponse(responseId: number): Observable<void> {
    return this.apiService.post(`/response/reject/${responseId}`, {});
  }
}
