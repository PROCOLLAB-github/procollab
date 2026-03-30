/** @format */

import { inject } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { Project } from "@domain/project/project.model";
import { GetAllProjectsUseCase } from "@api/project/use-case/get-all-projects.use-case";

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
  const getAllProjectsUseCase = inject(GetAllProjectsUseCase);

  return getAllProjectsUseCase.execute(new HttpParams({ fromObject: { limit: 16 } })).pipe(
    map(result =>
      result.ok
        ? result.value
        : {
            count: 0,
            results: [],
            next: "",
            previous: "",
          }
    )
  );
};
