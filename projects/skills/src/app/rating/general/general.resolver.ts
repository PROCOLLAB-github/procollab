/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { RatingService } from "../services/rating.service";
import type { GeneralRating } from "../../../models/rating.model";

/**
 * Резолвер для загрузки данных общего рейтинга
 *
 * Выполняется перед активацией маршрута общего рейтинга
 * и предоставляет начальные данные рейтинга с фильтром
 * по умолчанию (последний месяц).
 *
 * Это обеспечивает мгновенное отображение данных
 * при загрузке страницы рейтинга.
 *
 * @returns Observable<GeneralRating[]> - массив пользователей с рейтингом
 */
export const generalRatingResolver: ResolveFn<GeneralRating[]> = () => {
  const ratingService = inject(RatingService);
  return ratingService.getGeneralRating();
};
