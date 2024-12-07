/** @format */

import { inject } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { VacancyService } from "@office/services/vacancy.service";
import { map, tap } from "rxjs";

export const VacanciesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const vacancyService = inject(VacancyService);
  const vacancyId = route.params["vacancyId"];

  return vacancyService.getOne(vacancyId);
};
