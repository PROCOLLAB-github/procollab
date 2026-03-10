/** @format */

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map } from "rxjs";
import { TokenService } from "@corelib";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

/**
 * Guard для проверки аутентификации пользователя
 *
 * Назначение: Защищает маршруты, требующие аутентификации пользователя
 * Принимает: ActivatedRouteSnapshot и RouterStateSnapshot (параметры маршрута)
 * Возвращает: boolean или UrlTree для разрешения/запрета доступа к маршруту
 *
 * Функциональность:
 * - Проверяет наличие токенов аутентификации
 * - Валидирует токены через получение профиля пользователя
 * - Перенаправляет на страницу входа при отсутствии аутентификации
 * - Обрабатывает ошибки при проверке токенов
 * - Используется в конфигурации маршрутов для защиты приватных страниц
 */
export const AuthRequiredGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const authRepository = inject(AuthRepository);
  const router = inject(Router);

  if (tokenService.getTokens() === null) {
    return router.createUrlTree(["/auth/login"]);
  }

  return authRepository.fetchProfile().pipe(
    map(profile => !!profile),
    catchError(() => {
      return router.navigateByUrl("/auth/login");
    })
  );
};
