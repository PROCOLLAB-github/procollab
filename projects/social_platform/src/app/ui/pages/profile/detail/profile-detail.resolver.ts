/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { User } from "@domain/auth/user.model";
import { forkJoin, map, tap } from "rxjs";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

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
  const authRepository = inject(AuthInfoService);

  return forkJoin({
    user: authRepository.fetchUser(Number(route.paramMap.get("id"))).pipe(
      map(user => {
        const result = Object.assign(new User(), user);
        result.progress = calculateProfileProgress(result);
        return result;
      })
    ),
  });
};
