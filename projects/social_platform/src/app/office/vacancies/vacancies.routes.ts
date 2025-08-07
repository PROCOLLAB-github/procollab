/** @format */

import { Routes } from "@angular/router";
import { VacanciesComponent } from "./vacancies.component";
import { VacanciesResolver } from "./vacancies.resolver";
import { VacanciesListComponent } from "./list/list.component";

/**
 * Маршруты для модуля вакансий
 * Определяет структуру навигации и загрузку данных для страниц вакансий
 *
 * Структура маршрутов:
 * - /vacancies - корневой компонент с навигацией
 *   - /vacancies/all - список всех вакансий
 *   - /vacancies/my - список откликов пользователя
 * - /vacancies/:vacancyId - детальная информация о вакансии
 */
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
        // Ленивая загрузка маршрутов для откликов пользователя
        loadChildren: () => import("./list/list.routes").then(c => c.VACANCY_LIST_ROUTES),
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
    // Ленивая загрузка маршрутов для детальной информации о вакансии
    loadChildren: () =>
      import("./detail/vacancies-detail.routes").then(c => c.VACANCIES_DETAIL_ROUTES),
  },
];
