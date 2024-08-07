/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Vacancy } from "@office/models/vacancy.model";
import { VacancyService } from "@office/services/vacancy.service";

export const VacanciesResolver: ResolveFn<Vacancy[]> = route => {
  const vacanciesService = inject(VacancyService);

  return vacanciesService.getForProject(20, 0);
};
