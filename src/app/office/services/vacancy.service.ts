/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { Vacancy } from "../models/vacancy.model";
import { plainToClass } from "class-transformer";

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

  sendVacancy(vacancyId: number, body: { text: string }): Observable<void> {
    return this.apiService.post(`/vacancy/send/${vacancyId}`, body);
  }
}
