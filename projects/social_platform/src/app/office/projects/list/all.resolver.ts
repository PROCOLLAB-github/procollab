/** @format */

import { inject } from "@angular/core";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ResolveFn } from "@angular/router";

/**
 * РЕЗОЛВЕР ДЛЯ ПОЛУЧЕНИЯ ВСЕХ ПРОЕКТОВ
 *
 * - Предзагружает данные всех доступных проектов перед активацией маршрута
 * - Обеспечивает наличие данных в компоненте на момент его инициализации
 * - Используется в роутинге Angular для маршрута "все проекты"
 *
 * @param:
 * - Неявно: внедряется ProjectService через inject()
 * - Параметры маршрута и состояние роутера (не используются в данной реализации)
 *
 * @return:
 * - Observable<ApiPagination<Project>> - пагинированный список всех проектов
 * - Первая страница с лимитом 16 проектов
 *
 * Логика работы:
 * 1. Внедряет ProjectService через функцию inject()
 * 2. Вызывает метод getAll() с параметрами пагинации (limit: 16)
 * 3. Возвращает Observable, который будет разрешен перед активацией маршрута
 *
 * Использование:
 * - Подключается к маршруту в конфигурации роутера
 * - Результат доступен в компоненте через route.data['data']
 *
 * - Использует функциональный подход (ResolveFn) вместо класса
 * - Загружает только первые 16 проектов для оптимизации производительности
 * - Дополнительные проекты загружаются по мере прокрутки (infinite scroll)
 */
export const ProjectsAllResolver: ResolveFn<ApiPagination<Project>> = () => {
  const projectService = inject(ProjectService);

  return projectService.getAll(new HttpParams({ fromObject: { limit: 16 } }));
};
