/** @format */

import { Routes } from "@angular/router";
import { FeedComponent } from "@ui/pages/feed/feed.component";
import { FeedResolver } from "@ui/pages/feed/feed.resolver";

/** Маршруты для модуля ленты новостей. */
export const FEED_ROUTES: Routes = [
  {
    path: "", // Корневой путь модуля ленты
    component: FeedComponent, // Основной компонент для отображения
    resolve: {
      data: FeedResolver, // Предварительная загрузка данных через резолвер
    },
  },
];
