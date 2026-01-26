/** @format */

import { Routes } from "@angular/router";
import { ProgramListComponent } from "../../pages/program/detail/list/list.component";
import { ProgramDetailResolver } from "../../pages/program/detail/detail.resolver";
import { DeatilComponent } from "@ui/components/detail/detail.component";
import { ProgramDetailMainComponent } from "@ui/pages/program/detail/main/main.component";
import { ProgramProjectsResolver } from "@ui/pages/program/detail/list/projects.resolver";
import { ProgramMembersResolver } from "@ui/pages/program/detail/list/members.resolver";
import { ProgramRegisterComponent } from "@ui/pages/program/detail/register/register.component";
import { ProgramRegisterResolver } from "@ui/pages/program/detail/register/register.resolver";
import { ProgramDetailMainUIInfoService } from "../../../api/program/facades/detail/ui/program-detail-main-ui-info.service";

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
    component: DeatilComponent,
    resolve: {
      data: ProgramDetailResolver,
    },
    providers: [ProgramDetailMainUIInfoService],
    data: { listType: "program" },
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
        component: ProgramListComponent,
        data: { listType: "rating" },
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
