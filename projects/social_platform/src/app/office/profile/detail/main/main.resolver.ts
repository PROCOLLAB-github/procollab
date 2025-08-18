/** @format */

import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProfileNewsService } from "../services/profile-news.service";
import { inject } from "@angular/core";

/**
 * Резолвер для загрузки детальной информации о новости профиля
 *
 * Этот резолвер используется для предварительной загрузки конкретной новости
 * пользователя перед отображением компонента просмотра новости.
 *
 * Извлекает параметры:
 * - userId из родительского маршрута (ID пользователя-владельца профиля)
 * - newsId из текущего маршрута (ID конкретной новости)
 *
 * @param route - снимок активного маршрута с параметрами
 * @returns Observable<ProfileNews> - детальная информация о новости
 * @throws Error - если отсутствуют обязательные параметры userId или newsId
 *
 * Использует ProfileNewsService для выполнения HTTP запроса к API
 */
export const ProfileMainResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const profileNewsService = inject(ProfileNewsService);

  const userId = route.parent?.paramMap.get("id");
  const newsId = route.paramMap.get("newsId");

  if (!userId || !newsId) {
    throw new Error("Required parameters are missing");
  }

  return profileNewsService.fetchNewsDetail(userId, newsId);
};
