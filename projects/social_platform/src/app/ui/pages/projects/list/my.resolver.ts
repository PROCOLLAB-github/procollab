/** @format */

import { inject } from "@angular/core";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ResolveFn } from "@angular/router";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

/**
 * РЕЗОЛВЕР ДЛЯ ПОЛУЧЕНИЯ ПРОЕКТОВ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
 *
 * Назначение:
 * - Предзагружает данные проектов, принадлежащих текущему пользователю
 * - Обеспечивает наличие данных в компоненте на момент его инициализации
 * - Используется в роутинге Angular для маршрута "мои проекты"
 *
 * @params:
 * - Неявно: внедряется ProjectService через inject()
 * - Параметры маршрута и состояние роутера (не используются в данной реализации)
 *
 * @returns:
 * - Observable<ApiPagination<Project>> - пагинированный список проектов пользователя
 * - Первая страница с лимитом 16 проектов
 *
 * 1. Внедряет ProjectService через функцию inject()
 * 2. Вызывает метод getMy() с параметрами пагинации (limit: 16)
 * 3. Возвращает Observable, который будет разрешен перед активацией маршрута
 *
 * - Подключается к маршруту в конфигурации роутера
 * - Результат доступен в компоненте через route.data['data']
 *
 * Особенности:
 * - Использует функциональный подход (ResolveFn) вместо класса
 * - Загружает только проекты текущего авторизованного пользователя
 * - Загружает только первые 16 проектов для оптимизации производительности
 * - Дополнительные проекты загружаются по мере прокрутки (infinite scroll)
 */

export const ProjectsMyResolver: ResolveFn<ApiPagination<Project>> = () => {
  const projectService = inject(ProjectService);

  return projectService.getMy(new HttpParams({ fromObject: { limit: 16 } }));
};
