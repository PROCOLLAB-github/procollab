/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Observable } from "rxjs";
import { VacancyService } from "@services/vacancy.service";
import { Vacancy } from "@models/vacancy.model";

export const ProjectInfoResolver: ResolveFn<Vacancy[]> = (
  route: ActivatedRouteSnapshot
): Observable<Vacancy[]> => {
  const vacancyService = inject(VacancyService);
  const projectId = Number(route.paramMap.get("projectId"));

  return vacancyService.getForProject(projectId);
};
