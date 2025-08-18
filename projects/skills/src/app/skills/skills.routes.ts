/** @format */

import { Routes } from "@angular/router";
import { SkillsListComponent } from "./list/list.component";
import { skillsListResolver } from "./list/list.resolver";

/**
 * Конфигурация маршрутов для модуля навыков
 *
 * Определяет основные маршруты:
 * - '' - список всех навыков с резолвером для загрузки данных
 * - ':skillId' - детальная страница навыка с ленивой загрузкой дочерних маршрутов
 *
 * @returns {Routes} Массив конфигураций маршрутов для навыков
 */
export const SKILLS_ROUTES: Routes = [
  { path: "", component: SkillsListComponent, resolve: { data: skillsListResolver } },
  {
    path: ":skillId",
    loadChildren: () => import("./detail/detail.routes").then(m => m.DETAIL_ROUTES),
  },
];
