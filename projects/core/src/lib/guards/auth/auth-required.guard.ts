/** @format */

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TokenService } from "../../services/tokens/token.service";
import { authReturnUrl } from "../../models/auth/auth-return-url";

/**
 * Guard для ограничения доступа к маршрутам,
 * требующим аутентификации пользователя.
 *
 * Доступ разрешается только при:
 * - наличии сохранённых токенов;
 *
 * При ошибке проверки выполняется редирект на страницу авторизации.
 */
export const AuthRequiredGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // Проверка наличия токенов
  if (tokenService.getTokens() === null) {
    const returnUrl = authReturnUrl(state.url);
    return router.createUrlTree(["/auth/login"], {
      queryParams: returnUrl ? { returnUrl } : undefined,
    });
  }

  return true;
};
