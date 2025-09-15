/** @format */

import { Routes } from "@angular/router";
import { RateProjectsComponent } from "@office/program/detail/rate-projects/rate-projects.component";
import { ListComponent } from "./list/list.component";
import { ListAllResolver } from "./list-all.resolver";
// import { ListRatedResolver } from "./list/list-rated.resolver";

/**
 * Маршруты для модуля оценки проектов программы
 *
 * Определяет структуру навигации для экспертной оценки проектов:
 * - Главная страница с поиском и фильтрами
 * - Список всех проектов для оценки
 *
 * Структура маршрутов:
 * - "" - корневой компонент RateProjectsComponent
 *   - "" - редирект на "all"
 *   - "all" - список всех проектов с резолвером данных
 *
 * Закомментированный маршрут:
 * - "rated" - предположительно для уже оцененных проектов
 *
 * Резолверы:
 * - ListAllResolver - предзагружает проекты для оценки
 *
 * Компоненты:
 * - RateProjectsComponent - контейнер с поиском и навигацией
 * - ListComponent - отображение списка проектов
 *
 * @returns {Routes} Конфигурация маршрутов для оценки проектов
 */
export const RATE_PROJECTS_ROUTES: Routes = [
  {
    path: "",
    component: RateProjectsComponent,
    children: [
      {
        path: "",
        redirectTo: "all",
        pathMatch: "full",
      },
      {
        path: "all",
        component: ListComponent,
        resolve: {
          data: ListAllResolver,
        },
      },
      // {
      //   path: "rated",
      //   component: ListComponent,
      //   resolve: {
      //     data: ListRatedResolver,
      //   },
      // },
    ],
  },
];
