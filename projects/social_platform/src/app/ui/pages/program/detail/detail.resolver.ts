/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramDetailMainUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";
import { tap } from "rxjs";

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
  const programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  return programService
    .getOne(route.params["programId"])
    .pipe(tap(program => programDetailMainUIInfoService.applyFormatingProgramData(program)));
};
