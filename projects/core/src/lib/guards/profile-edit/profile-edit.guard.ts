/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";

/**
 * Guard для ограничения доступа к редактированию профиля.
 *
 * Разрешает переход только владельцу профиля,
 * идентификатор которого совпадает с параметром маршрута `id`.
 *
 * При несовпадении идентификаторов выполняется редирект
 * на страницу просмотра профиля.
 *
 * При ошибке получения текущего пользователя выполняется
 * редирект на страницу авторизации.
 */
export const ProfileEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authRepository = inject(AuthRepositoryPort);

  // Получение идентификатора профиля из параметров маршрута
  const profileId = Number(route.paramMap.get("id"));

  // Проверка совпадения идентификаторов профиля
  return authRepository.fetchProfile().pipe(
    map(profile =>
      profile.id === profileId ? true : router.createUrlTree([`/office/profile/${profileId}/`])
    ),
    catchError(() => of(router.createUrlTree(["/auth/login"])))
  );
};
