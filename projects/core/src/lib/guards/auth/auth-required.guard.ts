/** @format */

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TokenService } from "../../services/tokens/token.service";

/**
 * Guard для ограничения доступа к маршрутам,
 * требующим аутентификации пользователя.
 *
 * Доступ разрешается только при:
 * - наличии сохранённых токенов;
 *
 * При ошибке проверки выполняется редирект на страницу авторизации.
 */
export const AuthRequiredGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // Проверка наличия токенов
  if (tokenService.getTokens() === null) {
    return router.createUrlTree(["/auth/login"]);
  }

  return true;
};
