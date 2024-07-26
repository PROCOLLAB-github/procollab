/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Vacancy } from "@office/models/vacancy.model";
import { VacancyService } from "@office/services/vacancy.service";

export const VacanciesMyResolver: ResolveFn<Vacancy[]> = () => {
  const vacanciesService = inject(VacancyService);

  return vacanciesService.getMyVacancies(20, 0);
};
