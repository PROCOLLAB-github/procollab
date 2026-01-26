/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { SubscriptionService } from "projects/social_platform/src/app/api/subsriptions/subscription.service";
import { forkJoin, map, tap } from "rxjs";
import { ProfileDataService } from "../../../../api/profile/profile-date.service";
import { AuthService } from "../../../../api/auth";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

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
export const ProfileDetailResolver: ResolveFn<{ user: User; subs: Project[] }> = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const profileDataService = inject(ProfileDataService);

  return forkJoin({
    user: authService
      .getUser(Number(route.paramMap.get("id")))
      .pipe(tap(profile => profileDataService.setProfile(profile))),

    subs: subscriptionService.getSubscriptions(Number(route.paramMap.get("id"))).pipe(
      map(subs => subs.results),
      tap(subs => profileDataService.setProfileSubs(subs))
    ),
  });
};
