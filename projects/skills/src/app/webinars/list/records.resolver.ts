/** @format */

import { inject } from "@angular/core";
import { WebinarService } from "../services/webinar.service";

/**
 * Резолвер для загрузки записей вебинаров
 *
 * Предоставляет начальную порцию записей завершенных вебинаров
 * для отображения в списке. Загружает первые 20 записей.
 *
 * @returns Observable с пагинированным списком записей вебинаров
 */
export const RecordsResolver = () => {
  const webinarService = inject(WebinarService);

  return webinarService.getRecords(20, 0);
};
