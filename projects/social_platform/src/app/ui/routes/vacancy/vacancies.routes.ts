/** @format */

import { Routes } from "@angular/router";
import { VacanciesListComponent } from "@ui/pages/vacancies/list/list.component";
import { VacanciesComponent } from "@ui/pages/vacancies/vacancies.component";
import { VacanciesResolver } from "@ui/pages/vacancies/vacancies.resolver";

/** Маршруты для модуля вакансий. */
export const VACANCIES_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesComponent, // Корневой компонент с навигационными вкладками
    children: [
      {
        path: "",
        redirectTo: "all", // Перенаправление на список всех вакансий по умолчанию
        pathMatch: "full",
      },
      {
        path: "my",
        loadChildren: () => import("./list.routes").then(c => c.VACANCY_LIST_ROUTES),
      },
      {
        path: "all",
        component: VacanciesListComponent, // Компонент списка всех вакансий
        resolve: {
          data: VacanciesResolver, // Резолвер для предзагрузки данных вакансий
        },
      },
    ],
  },
  {
    path: ":vacancyId",
    loadChildren: () => import("./vacancies-detail.routes").then(c => c.VACANCIES_DETAIL_ROUTES),
  },
];
