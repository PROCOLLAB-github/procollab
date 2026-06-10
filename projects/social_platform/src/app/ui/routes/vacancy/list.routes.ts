/** @format */

import { Routes } from "@angular/router";
import { VacanciesListComponent } from "@ui/pages/vacancies/list/list.component";
import { VacanciesMyResolver } from "@ui/pages/vacancies/list/my.resolver";

/** Конфигурация маршрутов для страницы "Мои отклики". */
export const VACANCY_LIST_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesListComponent,
    resolve: {
      data: VacanciesMyResolver,
    },
  },
];
