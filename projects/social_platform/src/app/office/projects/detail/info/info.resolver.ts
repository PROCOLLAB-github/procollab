/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyService } from "@services/vacancy.service";
import { Vacancy } from "@models/vacancy.model";

export const ProjectInfoResolver: ResolveFn<Vacancy[]> = (route: ActivatedRouteSnapshot) => {
  const vacancyService = inject(VacancyService);
  const projectId = Number(route.paramMap.get("projectId"));

  return vacancyService.getForProject(0, 20, projectId);
};
