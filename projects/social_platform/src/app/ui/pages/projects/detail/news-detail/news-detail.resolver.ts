/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of, switchMap } from "rxjs";
import { FeedNews } from "@domain/project/project-news.model";
import { GetProjectNewsDetailUseCase } from "@api/project/use-cases/get-project-news-detail.use-case";

/**
 * РЕЗОЛВЕР ДЛЯ ЗАГРУЗКИ ДЕТАЛЬНОЙ ИНФОРМАЦИИ О НОВОСТИ
 *
 * Этот резолвер загружает детальную информацию о конкретной новости проекта
 * перед отображением компонента детальной новости.
 *
 * НАЗНАЧЕНИЕ:
 * - Загружает детальные данные новости до инициализации компонента
 * - Обеспечивает доступность данных в момент создания компонента
 * - Предотвращает отображение пустого состояния во время загрузки
 *
 * @params
 * - route: ActivatedRouteSnapshot - снимок активного маршрута с параметрами
 *
 * ИЗВЛЕКАЕМЫЕ ДАННЫЕ:
 * - projectId - ID проекта из родительского маршрута
 * - newsId - ID новости из параметров текущего маршрута
 *
 * @returns
 * - Observable<FeedNews> - объект с детальной информацией о новости
 *
 * ОСОБЕННОСТИ:
 * - Использует иерархию маршрутов (parent/child)
 * - Извлекает параметры из разных уровней маршрутизации
 */
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
