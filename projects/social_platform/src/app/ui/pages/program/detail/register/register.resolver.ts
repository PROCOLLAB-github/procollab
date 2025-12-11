/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { ProgramDataSchema } from "projects/social_platform/src/app/domain/program/program.model";

/**
 * Резолвер для получения схемы данных регистрации в программе
 *
 * Предзагружает схему дополнительных полей, которые нужно заполнить
 * при регистрации в конкретной программе. Каждая программа может иметь
 * свои уникальные поля для сбора информации о участниках.
 *
 * Принимает:
 * @param {ActivatedRouteSnapshot} route - Снимок маршрута с параметрами
 *
 * Использует:
 * @param {ProgramService} programService - Инжектируемый сервис программ
 *
 * Логика:
 * - Извлекает programId из параметров маршрута
 * - Загружает схему данных через programService.getDataSchema()
 *
 * Возвращает:
 * @returns {Observable<ProgramDataSchema>} Схема полей для регистрации
 *
 * Схема содержит:
 * - Названия полей
 * - Типы полей (text, email, etc.)
 * - Плейсхолдеры для полей
 * - Другие метаданные для генерации формы
 *
 * Используется в:
 * Маршруте register для предзагрузки схемы формы
 */
export const ProgramRegisterResolver: ResolveFn<ProgramDataSchema> = (
  route: ActivatedRouteSnapshot
) => {
  const programService = inject(ProgramService);

  return programService.getDataSchema(route.params["programId"]);
};
