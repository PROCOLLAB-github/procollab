/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";

export const NewsDetailResolver: ResolveFn<FeedNews> = (route: ActivatedRouteSnapshot) => {
  const projectNewsService = inject(ProjectNewsService);

  const projectId = route.parent?.params["projectId"];
  const newsId = route.params["newsId"];

  return projectNewsService.fetchNewsDetail(projectId, newsId);
};
