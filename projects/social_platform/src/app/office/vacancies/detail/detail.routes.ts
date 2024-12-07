/** @format */

import { VacanciesDetailComponent } from "./vacancies-detail.component";
import { VacanciesDetailResolver } from "./detail.resolver";

export const VACANCIES_DETAIL_ROUTES = [
  {
    path: "",
    component: VacanciesDetailComponent,
    resolve: {
      data: VacanciesDetailResolver,
    },
  },
];
