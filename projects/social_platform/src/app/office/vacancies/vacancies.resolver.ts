/** @format */

import { inject } from "@angular/core";
import { VacancyService } from "@office/services/vacancy.service";

export const VacanciesResolver = () => {
  const vacanciesService = inject(VacancyService);

  return vacanciesService.getForProject(20, 0);
};
