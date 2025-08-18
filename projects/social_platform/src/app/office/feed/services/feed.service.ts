/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { FeedItem, FeedItemType } from "@office/feed/models/feed-item.model";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

/**
 * СЕРВИС ДЛЯ РАБОТЫ С ЛЕНТОЙ НОВОСТЕЙ
 *
 * Предоставляет методы для взаимодействия с API ленты новостей.
 * Обрабатывает запросы на получение элементов ленты с поддержкой
 * пагинации и фильтрации по типам контента.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Загрузка элементов ленты с сервера
 * - Поддержка пагинации (offset/limit)
 * - Фильтрация по типам контента
 * - Обработка параметров запроса
 *
 * ИСПОЛЬЗУЕТСЯ В:
 * - FeedComponent для загрузки данных
 * - FeedResolver для предварительной загрузки
 * - FeedFilterComponent для работы с фильтрами
 */
@Injectable({
  providedIn: "root",
})
export class FeedService {
  private readonly FEED_URL = "/feed";

  constructor(private readonly apiService: ApiService) {}

  /**
   * СИМВОЛ РАЗДЕЛЕНИЯ ФИЛЬТРОВ
   *
   * Используется для объединения множественных фильтров в строку
   * для передачи в URL параметрах и API запросах
   */
  readonly FILTER_SPLIT_SYMBOL = "|";

  /**
   * ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ЛЕНТЫ
   *
   * Основной метод для загрузки элементов ленты с сервера.
   * Поддерживает пагинацию и фильтрацию по типам контента.
   *
   * ЧТО ПРИНИМАЕТ:
   * @param offset - смещение для пагинации (с какого элемента начинать)
   * @param limit - максимальное количество элементов для загрузки
   * @param type - тип(ы) элементов для фильтрации (строка или массив)
   *
   * ЧТО ВОЗВРАЩАЕТ:
   * @returns Observable<ApiPagination<FeedItem>> - пагинированный ответ с элементами ленты
   *
   * ЛОГИКА ОБРАБОТКИ ТИПОВ:
   * - Если массив пустой: загружаются все типы по умолчанию
   * - Если массив: элементы объединяются через разделитель
   * - Если строка: используется как есть
   */
  getFeed(
    offset: number,
    limit: number,
    type: FeedItemType[] | FeedItemType
  ): Observable<ApiPagination<FeedItem>> {
    let reqType: string;

    // Обработка различных форматов параметра type
    if (type.length === 0) {
      // Если фильтры не выбраны, загружаем все типы по умолчанию
      reqType = ["vacancy", "news", "project"].join(this.FILTER_SPLIT_SYMBOL);
    } else if (Array.isArray(type)) {
      // Если передан массив типов, объединяем их через разделитель
      reqType = type.join(this.FILTER_SPLIT_SYMBOL);
    } else {
      // Если передана строка, используем как есть
      reqType = type;
    }

    // Выполняем GET запрос к API с параметрами пагинации и фильтрации
    return this.apiService.get(
      `${this.FEED_URL}/`,
      new HttpParams({
        fromObject: {
          limit,
          offset,
          type: reqType,
        },
      })
    );
  }
}
