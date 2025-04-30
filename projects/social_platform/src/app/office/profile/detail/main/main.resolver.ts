/** @format */

import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProfileNewsService } from "../services/profile-news.service";
import { inject } from "@angular/core";

export const ProfileMainResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const profileNewsService = inject(ProfileNewsService);

  const userId = route.parent?.paramMap.get("id");
  const newsId = route.paramMap.get("newsId");

  if (!userId || !newsId) {
    throw new Error("Required parameters are missing");
  }

  return profileNewsService.fetchNewsDetail(userId, newsId);
};
