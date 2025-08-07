/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { Profile } from "../../models/profile.model";
import { ProfileService } from "./services/profile.service";

/**
 * Резолвер для загрузки данных профиля пользователя
 *
 * Выполняется перед активацией маршрута профиля и предоставляет
 * полную информацию о пользователе, включая навыки и прогресс.
 *
 * Это гарантирует, что данные профиля будут доступны
 * во всех дочерних компонентах профиля сразу при загрузке.
 *
 * @returns Observable<Profile> - полные данные профиля пользователя
 */
export const profileResolver: ResolveFn<Profile> = () => {
  const profileService = inject(ProfileService);
  return profileService.getProfile();
};
