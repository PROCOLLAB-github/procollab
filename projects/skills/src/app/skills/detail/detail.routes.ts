/** @format */

import type { Routes } from "@angular/router";
import { SkillDetailComponent } from "./detail.component";
import { skillDetailResolver } from "./detail.resolver";

/**
 * Маршруты для детальной страницы навыка
 *
 * Определяет единственный маршрут для отображения детальной информации о навыке
 * с резолвером для предварительной загрузки данных
 *
 * @returns {Routes} Конфигурация маршрута для детальной страницы
 */
export const DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: SkillDetailComponent,
    resolve: {
      data: skillDetailResolver,
    },
  },
];
