/** @format */

import { Routes } from "@angular/router";
import { ProgramDetailComponent } from "@office/program/detail/detail/detail.component";
import { ProgramDetailResolver } from "@office/program/detail/detail/detail.resolver";
import { ProgramDetailMainComponent } from "@office/program/detail/main/main.component";
import { ProgramRegisterComponent } from "@office/program/detail/register/register.component";
import { ProgramRegisterResolver } from "@office/program/detail/register/register.resolver";
import { ProgramProjectsResolver } from "@office/program/detail/list/projects.resolver";
import { ProgramMembersResolver } from "@office/program/detail/list/members.resolver";
import { RateProjectsComponent } from "./rate-projects/rate-projects.component";
import { ProgramListComponent } from "./list/list.component";

/**
 * Маршруты для детальной страницы программы
 *
 * Определяет структуру навигации внутри детальной страницы программы:
 * - Основная информация (по умолчанию)
 * - Список проектов программы
 * - Список участников программы
 * - Страница регистрации в программе
 *
 * Все маршруты используют резолверы для предзагрузки данных.
 *
 * @returns {Routes} Конфигурация маршрутов для детальной страницы программы
 */
export const PROGRAM_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: ProgramDetailComponent,
    resolve: {
      data: ProgramDetailResolver,
    },
    children: [
      {
        path: "",
        component: ProgramDetailMainComponent,
      },
      {
        path: "projects",
        component: ProgramListComponent,
        resolve: {
          data: ProgramProjectsResolver,
        },
        data: { listType: "projects" },
      },
      {
        path: "members",
        component: ProgramListComponent,
        resolve: {
          data: ProgramMembersResolver,
        },
        data: { listType: "members" },
      },
      {
        path: "projects-rating",
        component: RateProjectsComponent,
      },
    ],
  },
  {
    path: "register",
    component: ProgramRegisterComponent,
    resolve: {
      data: ProgramRegisterResolver,
    },
  },
];
