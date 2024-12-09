/** @format */

import { Routes } from "@angular/router";
import { VacanciesListComponent } from "./list.component";
import { VacanciesMyResolver } from "./my.resolver";

export const VACANCY_LIST_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesListComponent,
    resolve: {
      data: VacanciesMyResolver,
    },
  },
];
