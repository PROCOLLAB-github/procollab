/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { VacancyService } from "@office/services/vacancy.service";

export const VacanciesMyResolver: ResolveFn<VacancyResponse[]> = () => {
  const vacanciesService = inject(VacancyService);

  return vacanciesService.getMyVacancies(20, 0);
};
