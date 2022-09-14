/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { Vacancy } from "../models/vacancy.model";
import { plainToClass } from "class-transformer";
import { VacancyResponse } from "../models/vacancy-response.model";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  constructor(private apiService: ApiService) {}

  getForProject(projectId: number): Observable<Vacancy[]> {
    return this.apiService.get(`/vacancy/project/${projectId}`);
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
      .pipe(map(vacancy => plainToClass(Vacancy, vacancy)));
  }

  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`/vacancy/${vacancyId}`);
  }

  sendResponse(vacancyId: number, body: { text: string }): Observable<void> {
    return this.apiService.post(`/response/send/${vacancyId}`, body);
  }

  responsesByProject(projectId: number): Observable<VacancyResponse> {
    return this.apiService
      .get(`/response/${projectId}`)
      .pipe(map(response => plainToClass(VacancyResponse, response)));
  }
}
