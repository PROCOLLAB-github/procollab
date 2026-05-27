/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { User } from "@domain/auth/user.model";
import { forkJoin, map, tap } from "rxjs";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

/** Предзагружает данные профиля пользователя. */
export const ProfileDetailResolver: ResolveFn<{ user: User }> = (route: ActivatedRouteSnapshot) => {
  const authRepository = inject(AuthInfoService);

  return forkJoin({
    user: authRepository.fetchUser(Number(route.paramMap.get("id"))).pipe(
      map(user => {
        const result = Object.assign(new User(), user);
        result.relations.progress = calculateProfileProgress(result);
        return result;
      })
    ),
  });
};
