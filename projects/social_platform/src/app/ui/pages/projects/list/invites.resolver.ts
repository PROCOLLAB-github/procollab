/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { GetMyInvitesUseCase } from "projects/social_platform/src/app/api/invite/use-cases/get-my-invites.use-case";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { map } from "rxjs";

/**
 * Резолвер для предзагрузки приглашений пользователя
 * Загружает данные о приглашениях перед инициализацией компонента офиса
 *
 * Принимает:
 * - Контекст маршрута (неявно через Angular DI)
 *
 * Возвращает:
 * - Observable<Invite[]> - массив приглашений пользователя
 */
export const ProjectsInvitesResolver: ResolveFn<Invite[]> = () => {
  const getMyInvitesUseCase = inject(GetMyInvitesUseCase);

  return getMyInvitesUseCase.execute().pipe(map(result => (result.ok ? result.value : [])));
};
