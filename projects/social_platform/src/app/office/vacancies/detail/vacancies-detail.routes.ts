/** @format */

import { VacancyInfoComponent } from "./info/info.component";
import { VacanciesDetailComponent } from "./vacancies-detail.component";
import { VacanciesDetailResolver } from "./vacancies-detail.resolver";

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
