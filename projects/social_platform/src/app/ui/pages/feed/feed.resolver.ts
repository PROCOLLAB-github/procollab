/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { FeedItem } from "../../../domain/feed/feed-item.model";
import { FeedService } from "../../../api/feed/feed.service";

/**
 * резолвер ленты новостей
 *
 * Этот резолвер предназначен для предварительной загрузки данных ленты новостей
 * перед отображением компонента. Выполняется автоматически при навигации на маршрут.
 *
 * ЧТО ДЕЛАЕТ:
 * - Загружает первую страницу ленты новостей (20 элементов)
 * - Получает параметры фильтрации из URL (includes)
 * - Возвращает пагинированный список элементов ленты
 *
 * @param route - объект маршрута с параметрами запроса
 *
 * @returns Observable<ApiPagination<FeedItem>> - пагинированный список элементов ленты
 */
export const FeedResolver: ResolveFn<ApiPagination<FeedItem>> = route => {
  const feedService = inject(FeedService);

  // Загружаем первую страницу ленты (offset: 0, limit: 20)
  // По умолчанию включаем вакансии, новости и проекты
  return feedService.getFeed(
    0,
    20,
    route.queryParams["includes"] ?? ["vacancy", "news", "project"]
  );
};
