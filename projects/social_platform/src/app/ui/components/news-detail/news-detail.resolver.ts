/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { FeedNews } from "../../../domain/project/project-news.model";
import { ProjectNewsService } from "../../../api/project/project-news.service";

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
  const projectNewsService = inject(ProjectNewsService); // Инъекция сервиса новостей проекта

  // Извлекаем ID проекта из родительского маршрута
  const projectId = route.parent?.params["projectId"];
  // Извлекаем ID новости из текущего маршрута
  const newsId = route.params["newsId"];

  // Возвращаем Observable с детальной информацией о новости
  return projectNewsService.fetchNewsDetail(projectId, newsId);
};
