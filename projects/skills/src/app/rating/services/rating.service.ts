/** @format */

import { inject, Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { HttpParams } from "@angular/common/http";
import { GeneralRating } from "../../../models/rating.model";
import { map } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";

/**
 * Сервис для работы с рейтингами пользователей
 *
 * Предоставляет методы для получения различных типов рейтингов
 * с поддержкой фильтрации по временным периодам.
 *
 * Взаимодействует с API для получения актуальных данных
 * о достижениях и позициях пользователей в системе.
 */
@Injectable({
  providedIn: "root",
})
export class RatingService {
  private readonly PROGRESS_URL = "/progress";

  private apiService = inject(SkillsApiService);

  /**
   * Получение общего рейтинга пользователей
   *
   * Загружает рейтинг всех пользователей системы с возможностью
   * фильтрации по различным временным периодам.
   *
   * @param ratingParam - временной период для расчета рейтинга:
   *   - 'last_day' - за последний день
   *   - 'last_week' - за последнюю неделю
   *   - 'last_month' - за последний месяц (по умолчанию)
   *   - 'last_year' - за последний год
   *
   * @returns Observable<GeneralRating[]> - массив пользователей с их рейтинговыми данными,
   *   отсортированный по убыванию количества баллов
   */
  getGeneralRating(
    ratingParam: "last_year" | "last_month" | "last_day" | "last_week" = "last_month"
  ) {
    return this.apiService
      .get<ApiPagination<GeneralRating>>(
        `${this.PROGRESS_URL}/user-rating/`,
        new HttpParams({
          fromObject: {
            time_frame: ratingParam,
          },
        })
      )
      .pipe(map(res => res.results));
  }
}
