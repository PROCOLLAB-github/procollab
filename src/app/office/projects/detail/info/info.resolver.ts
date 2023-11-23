/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { VacancyService } from "@services/vacancy.service";
import { Vacancy } from "@models/vacancy.model";

@Injectable({
  providedIn: "root",
})
export class ProjectInfoResolver  {
  constructor(private readonly vacancyService: VacancyService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Vacancy[]> {
    const projectId = Number(route.paramMap.get("projectId"));

    return this.vacancyService.getForProject(projectId);
  }
}
