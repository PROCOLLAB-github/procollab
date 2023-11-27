/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyResponse } from "@models/vacancy-response.model";
import { VacancyService } from "@services/vacancy.service";

export const ProjectResponsesResolver: ResolveFn<VacancyResponse[]> = (
  route: ActivatedRouteSnapshot
) => {
  const vacancyService = inject(VacancyService);

  return vacancyService.responsesByProject(Number(route.parent?.paramMap.get("projectId")));
};
