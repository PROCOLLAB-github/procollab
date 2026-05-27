/** @format */

import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { map } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { GetProfileNewsDetailUseCase } from "@api/profile/use-cases/get-profile-news-detail.use-case";

/** Предзагружает детальную информацию о новости профиля. */
export const ProfileMainResolver: ResolveFn<ProfileNews> = (route: ActivatedRouteSnapshot) => {
  const getProfileNewsDetailUseCase = inject(GetProfileNewsDetailUseCase);

  const userId = route.parent?.paramMap.get("id");
  const newsId = route.paramMap.get("newsId");

  if (!userId || !newsId) {
    throw new Error("Required parameters are missing");
  }

  return getProfileNewsDetailUseCase
    .execute(userId, newsId)
    .pipe(map(result => (result.ok ? result.value : new ProfileNews())));
};
