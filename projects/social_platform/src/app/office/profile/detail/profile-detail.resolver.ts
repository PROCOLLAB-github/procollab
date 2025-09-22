/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { SubscriptionService } from "@office/services/subscription.service";
import { forkJoin, map, mergeMap, tap } from "rxjs";
import { Project } from "@office/models/project.model";
import { ProfileDataService } from "./services/profile-date.service";
import { profile } from "console";

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
export const ProfileDetailResolver: ResolveFn<[User, Project[]]> = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const profileDataService = inject(ProfileDataService);

  return forkJoin([
    authService
      .getUser(Number(route.paramMap.get("id")))
      .pipe(tap(profile => profileDataService.setProfile(profile))),

    subscriptionService.getSubscriptions(Number(route.paramMap.get("id"))).pipe(
      map(subs => subs.results),
      tap(subs => profileDataService.setProfileSubs(subs))
    ),
  ]);
};
