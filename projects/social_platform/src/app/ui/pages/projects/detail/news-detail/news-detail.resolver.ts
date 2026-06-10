/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of, switchMap } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { GetProjectNewsDetailUseCase } from "@api/project/use-cases/get-project-news-detail.use-case";

/** Предзагружает детальную информацию о новости проекта. */
export const NewsDetailResolver: ResolveFn<FeedNews> = (route: ActivatedRouteSnapshot) => {
  const getProjectNewsDetailUseCase = inject(GetProjectNewsDetailUseCase);

  // Извлекаем ID проекта из родительского маршрута
  const projectId = route.parent?.params["projectId"];
  // Извлекаем ID новости из текущего маршрута
  const newsId = route.params["newsId"];

  // Возвращаем Observable с детальной информацией о новости
  return getProjectNewsDetailUseCase
    .execute(projectId, newsId)
    .pipe(switchMap(result => of(result.ok ? result.value : new FeedNews())));
};
