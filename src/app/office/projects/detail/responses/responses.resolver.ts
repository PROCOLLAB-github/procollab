/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { VacancyResponse } from "@models/vacancy-response.model";
import { VacancyService } from "@services/vacancy.service";

@Injectable({
  providedIn: "root",
})
export class ProjectResponsesResolver implements Resolve<VacancyResponse[]> {
  constructor(private readonly vacancyService: VacancyService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<VacancyResponse[]> {
    return this.vacancyService.responsesByProject(Number(route.paramMap.get("projectId")));
  }
}
