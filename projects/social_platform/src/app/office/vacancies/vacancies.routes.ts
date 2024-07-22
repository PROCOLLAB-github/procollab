/** @format */

import { Routes } from "@angular/router";
import { VacanciesComponent } from "./vacancies.component";
import { VacanciesResolver } from "./vacancies.resolver";
import { VacanciesMyResolver } from "./list/my.resolver";
import { VacanciesListComponent } from "./list/list.component";

export const VACANCIES_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesComponent,
    children: [
      {
        path: "",
        redirectTo: "all",
        pathMatch: "full",
      },
      {
        path: "my",
        loadChildren: () => import("./list/list.routes").then(c => c.VACANCY_LIST_ROUTES),
      },
      {
        path: "all",
        component: VacanciesListComponent,
        resolve: {
          data: VacanciesResolver,
        },
      },
    ],
  },
];
