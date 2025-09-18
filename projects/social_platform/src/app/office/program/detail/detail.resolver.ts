/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { Program } from "@office/program/models/program.model";

/**
 * Резолвер для получения детальной информации о программе
 *
 * Предзагружает полную информацию о программе перед отображением
 * детальной страницы. Это обеспечивает мгновенное отображение
 * данных программы во всех дочерних компонентах.
 *
 * Принимает:
 * @param {ActivatedRouteSnapshot} route - Снимок маршрута с параметрами
 *
 * Использует:
 * @param {ProgramService} programService - Инжектируемый сервис программ
 *
 * Логика:
 * - Извлекает programId из параметров маршрута
 * - Загружает детальную информацию через programService.getOne()
 *
 * Возвращает:
 * @returns {Observable<Program>} Полная информация о программе
 *
 * Загружаемые данные включают:
 * - Основную информацию (название, описание, даты)
 * - Изображения и медиа файлы
 * - Права текущего пользователя (участник, менеджер)
 * - Статистику (просмотры, лайки)
 * - Дополнительные материалы и ссылки
 *
 * Используется в:
 * Родительском маршруте детальной страницы программы
 */
export const ProgramDetailResolver: ResolveFn<Program> = (route: ActivatedRouteSnapshot) => {
  const programService = inject(ProgramService);

  return programService.getOne(route.params["programId"]);
};
