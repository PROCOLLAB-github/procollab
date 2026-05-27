/** @format */

import { VacancyInfoComponent } from "../../pages/vacancies/detail/info/info.component";
import { VacanciesDetailComponent } from "../../pages/vacancies/detail/vacancies-detail.component";
import { VacanciesDetailResolver } from "../../pages/vacancies/detail/vacancies-detail.resolver";

/** Конфигурация маршрутов для детального просмотра вакансии. */
export const VACANCIES_DETAIL_ROUTES = [
  {
    path: "",
    component: VacanciesDetailComponent,
    resolve: {
      data: VacanciesDetailResolver,
    },
    children: [
      {
        path: "",
        component: VacancyInfoComponent,
      },
    ],
  },
];
