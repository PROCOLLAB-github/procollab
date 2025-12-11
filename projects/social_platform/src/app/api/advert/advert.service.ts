/** @format */

import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { New } from "projects/social_platform/src/app/domain/news/article.model";
import { ApiService } from "projects/core";
import { plainToInstance } from "class-transformer";

/**
 * Сервис для работы с новостями и рекламными материалами
 *
 * Предоставляет функциональность для:
 * - Получения списка всех новостей
 * - Получения детальной информации о конкретной новости
 * - Преобразования данных в типизированные объекты
 */
@Injectable({
  providedIn: "root",
})
export class AdvertService {
  private readonly NEWS_URL = "/news";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список всех новостей и рекламных материалов
   * Преобразует полученные данные в массив типизированных объектов New
   *
   * @returns Observable<New[]> - массив новостей с заголовками, содержимым и метаданными
   */
  getAll(): Observable<New[]> {
    return this.apiService
      .get<New[]>(`${this.NEWS_URL}/`)
      .pipe(map(adverts => plainToInstance(New, adverts)));
  }

  /**
   * Получает детальную информацию о конкретной новости
   * Преобразует полученные данные в типизированный объект New
   *
   * @param advertId - уникальный идентификатор новости
   * @returns Observable<New> - объект новости со всеми полями (заголовок, содержимое, дата, автор и т.д.)
   */
  getOne(advertId: number): Observable<New> {
    return this.apiService
      .get(`${this.NEWS_URL}/${advertId}/`)
      .pipe(map(advert => plainToInstance(New, advert)));
  }
}
