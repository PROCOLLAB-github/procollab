/** @format */

import { inject, Injectable } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { ApiService } from "projects/core";
import { ProfileNews } from "../../domain/profile/profile-news.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { StorageService } from "projects/social_platform/src/app/api/storage/storage.service";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";

/**
 * Сервис для работы с новостями профиля пользователя
 *
 * Предоставляет методы для выполнения CRUD операций с новостями профиля:
 * - Получение списка новостей пользователя с пагинацией
 * - Получение детальной информации о конкретной новости
 * - Создание новых новостей с текстом и файлами
 * - Редактирование существующих новостей
 * - Удаление новостей
 * - Управление лайками новостей
 * - Отслеживание просмотров новостей с кешированием в sessionStorage
 *
 * Использует:
 * - ApiService для HTTP запросов к backend API
 * - StorageService для кеширования просмотренных новостей
 * - class-transformer для преобразования ответов API в модели
 * - RxJS операторы для обработки асинхронных операций
 *
 * @injectable - сервис доступен для внедрения зависимостей
 * @providedIn 'root' - синглтон на уровне приложения
 */
@Injectable({
  providedIn: "root",
})
export class ProfileNewsService {
  private readonly AUTH_USERS_URL = "/auth/users";

  storageService = inject(StorageService);
  apiService = inject(ApiService);

  /**
   * Получение списка новостей пользователя
   * @param userId - идентификатор пользователя
   * @returns Observable<ApiPagination<ProfileNews>> - пагинированный список новостей
   */
  fetchNews(userId: string): Observable<ApiPagination<ProfileNews>> {
    return this.apiService.get<ApiPagination<ProfileNews>>(
      `${this.AUTH_USERS_URL}/${userId}/news/`,
      new HttpParams({ fromObject: { limit: 10 } })
    );
  }

  /**
   * Получение детальной информации о конкретной новости
   * @param userId - идентификатор пользователя-владельца новости
   * @param newsId - идентификатор новости
   * @returns Observable<ProfileNews> - детальная информация о новости
   */
  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews> {
    return this.apiService
      .get<ProfileNews>(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}`)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }

  /**
   * Создание новой новости в профиле пользователя
   * @param userId - идентификатор пользователя
   * @param obj - объект с текстом и файлами новости
   * @returns Observable<ProfileNews> - созданная новость
   */
  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews> {
    return this.apiService
      .post(`${this.AUTH_USERS_URL}/${userId}/news/`, obj)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }

  /**
   * Отметка новостей как просмотренных
   * Использует sessionStorage для кеширования просмотренных новостей
   * @param userId - идентификатор пользователя
   * @param newsIds - массив идентификаторов новостей для отметки
   * @returns Observable<void[]> - результаты операций отметки просмотра
   */
  readNews(userId: number, newsIds: number[]): Observable<void[]> {
    const readNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];

    return forkJoin(
      newsIds
        .filter(id => !readNews.includes(id))
        .map(id =>
          this.apiService
            .post<void>(`${this.AUTH_USERS_URL}/${userId}/news/${id}/set_viewed/`, {})
            .pipe(
              tap(() => {
                this.storageService.setItem("readNews", [...readNews, id], sessionStorage);
              })
            )
        )
    );
  }

  /**
   * Удаление новости из профиля
   * @param userId - идентификатор пользователя
   * @param newsId - идентификатор удаляемой новости
   * @returns Observable<void> - результат операции удаления
   */
  delete(userId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`);
  }

  /**
   * Переключение лайка новости
   * @param userId - идентификатор пользователя-владельца новости
   * @param newsId - идентификатор новости
   * @param state - новое состояние лайка (true - лайк, false - убрать лайк)
   * @returns Observable<void> - результат операции изменения лайка
   */
  toggleLike(userId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  /**
   * Редактирование существующей новости
   * @param userId - идентификатор пользователя
   * @param newsId - идентификатор редактируемой новости
   * @param newsItem - частичные данные для обновления новости
   * @returns Observable<ProfileNews> - обновленная новость
   */
  editNews(
    userId: string,
    newsId: number,
    newsItem: Partial<ProfileNews>
  ): Observable<ProfileNews> {
    return this.apiService
      .patch(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`, newsItem)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }
}
