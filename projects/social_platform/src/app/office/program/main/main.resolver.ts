/** @format */

import { inject } from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "@models/api-pagination.model";
import { Program } from "@office/program/models/program.model";

/**
 * Резолвер для предзагрузки списка программ
 *
 * Загружает первую страницу программ перед отображением главного
 * компонента списка программ. Обеспечивает мгновенное отображение
 * данных без состояния загрузки.
 *
 * Использует:
 * @param {ProgramService} programService - Инжектируемый сервис программ
 *
 * Логика:
 * - Загружает первые 20 программ (skip: 0, take: 20)
 * - Не требует параметров маршрута
 *
 * Возвращает:
 * @returns {Observable<ApiPagination<Program>>} Пагинированный список программ
 *
 * Данные включают:
 * - Массив программ (results)
 * - Общее количество программ (count)
 * - Информацию о пагинации
 *
 * Каждая программа содержит:
 * - Основную информацию (название, описание, даты)
 * - Изображения и медиа
 * - Статистику просмотров и лайков
 * - Информацию о участии пользователя
 *
 * Используется в:
 * Главном маршруте списка программ (path: "all")
 */
export const ProgramMainResolver: ResolveFn<ApiPagination<Program>> = () => {
  const programService = inject(ProgramService);

  return programService.getAll(0, 20);
};
