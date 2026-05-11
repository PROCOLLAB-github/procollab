/** @format */

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map } from "rxjs";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { TokenService } from "../../services/tokens/token.service";

/**
 * Guard для ограничения доступа к маршрутам,
 * требующим аутентификации пользователя.
 *
 * Доступ разрешается только при:
 * - наличии сохранённых токенов;
 * - успешном получении профиля пользователя.
 *
 * При ошибке проверки выполняется редирект на страницу авторизации.
 */
export const AuthRequiredGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const authRepository = inject(AuthRepositoryPort);
  const router = inject(Router);

  // Проверка наличия токенов
  if (tokenService.getTokens() === null) {
    return router.createUrlTree(["/auth/login"]);
  }

  // Получение профиля пользователя и обработка ошибок
  return authRepository.fetchProfile().pipe(
    map(profile => !!profile),
    catchError(() => {
      return router.navigateByUrl("/auth/login");
    })
  );
};
