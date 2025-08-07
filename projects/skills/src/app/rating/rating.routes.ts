/** @format */

import { Routes } from "@angular/router";
import { RatingGeneralComponent } from "./general/general.component";
import { generalRatingResolver } from "./general/general.resolver";

/**
 * Маршруты для модуля рейтинга
 *
 * Содержит:
 * - Корневой маршрут ("") - отображает общий компонент рейтинга
 * - Резолвер данных - предзагружает данные рейтинга перед отображением компонента
 */
export const RATING_ROUTES: Routes = [
  {
    // Корневой маршрут модуля рейтинга
    path: "",
    component: RatingGeneralComponent, // Компонент для отображения общего рейтинга
    resolve: {
      data: generalRatingResolver, // Резолвер для предзагрузки данных рейтинга
    },
  },
];
