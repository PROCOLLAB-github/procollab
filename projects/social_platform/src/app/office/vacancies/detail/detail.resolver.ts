/** @format */

import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VacancyService } from "@office/services/vacancy.service";
import { map, tap } from "rxjs";

export const VacanciesDetailResolver = (route: ActivatedRoute) => {
  const vacancyService = inject(VacancyService);
  const vacancyId = route.snapshot.params["vacancyId"];

  return vacancyService.getOne(vacancyId);
};
