/** @format */

import { inject } from "@angular/core";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { ResolveFn } from "@angular/router";
import { GetMyInvitesUseCase } from "../../../api/invite/use-cases/get-my-invites.use-case";
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
export const OfficeResolver: ResolveFn<Invite[]> = () => {
  const getMyInvitesUseCase = inject(GetMyInvitesUseCase);

  return getMyInvitesUseCase.execute().pipe(map(result => (result.ok ? result.value : [])));
};
