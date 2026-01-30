/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { forkJoin, map, tap } from "rxjs";
import { AuthService } from "../../../../api/auth";
import { calculateProfileProgress } from "@utils/calculateProgress";

/**
 * Резолвер для загрузки данных профиля пользователя
 *
 * Этот резолвер выполняется перед активацией маршрута детального просмотра профиля
 * и предварительно загружает необходимые данные пользователя и его подписки на проекты.
 *
 * Загружаемые данные:
 * - Полная информация о пользователе (User)
 * - Список проектов, на которые подписан пользователь (Project[])
 *
 * @param route - снимок активного маршрута, содержащий параметр 'id' пользователя
 * @returns Observable<[User, Project[]]> - кортеж с данными пользователя и его подписками
 *
 * Использует:
 * - AuthService для получения информации о пользователе
 * - SubscriptionService для получения подписок пользователя
 * - forkJoin для параллельного выполнения запросов
 */
export const ProfileDetailResolver: ResolveFn<{ user: User }> = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);

  return forkJoin({
    user: authService.getUser(Number(route.paramMap.get("id"))).pipe(
      map(user => {
        const result = Object.assign(new User(), user);
        result.progress = calculateProfileProgress(result);
        return result;
      })
    ),
  });
};
