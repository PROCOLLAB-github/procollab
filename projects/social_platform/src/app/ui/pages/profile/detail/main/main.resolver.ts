/** @format */

import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { map } from "rxjs";
import { ProfileNews } from "projects/social_platform/src/app/domain/profile/profile-news.model";
import { GetProfileNewsDetailUseCase } from "projects/social_platform/src/app/api/profile/use-cases/get-profile-news-detail.use-case";

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
export const ProfileMainResolver: ResolveFn<ProfileNews> = (route: ActivatedRouteSnapshot) => {
  const getProfileNewsDetailUseCase = inject(GetProfileNewsDetailUseCase);

  const userId = route.parent?.paramMap.get("id");
  const newsId = route.paramMap.get("newsId");

  if (!userId || !newsId) {
    throw new Error("Required parameters are missing");
  }

  return getProfileNewsDetailUseCase
    .execute(userId, newsId)
    .pipe(map(result => (result.ok ? result.value : new ProfileNews())));
};
