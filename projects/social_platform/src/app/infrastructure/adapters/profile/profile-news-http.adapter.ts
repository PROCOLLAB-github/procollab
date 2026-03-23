/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProfileNews } from "../../../domain/profile/profile-news.model";

@Injectable({ providedIn: "root" })
export class ProfileNewsHttpAdapter {
  private readonly AUTH_USERS_URL = "/auth/users";
  private readonly apiService = inject(ApiService);

  /**
   * Получение списка новостей пользователя.
   *
   * @param userId идентификатор пользователя
   * @returns пагинированный список новостей
   */
  fetchNews(userId: string): Observable<ApiPagination<ProfileNews>> {
    return this.apiService.get<ApiPagination<ProfileNews>>(
      `${this.AUTH_USERS_URL}/${userId}/news/`,
      new HttpParams({ fromObject: { limit: 10 } })
    );
  }

  /**
   * Получение детальной информации о конкретной новости.
   *
   * @param userId идентификатор пользователя-владельца новости
   * @param newsId идентификатор новости
   */
  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews> {
    return this.apiService.get<ProfileNews>(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}`);
  }

  /**
   * Создание новой новости в профиле пользователя.
   *
   * @param userId идентификатор пользователя
   * @param obj объект с текстом и файлами новости
   */
  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews> {
    return this.apiService.post<ProfileNews>(`${this.AUTH_USERS_URL}/${userId}/news/`, obj);
  }

  /**
   * Отметка новости как просмотренной.
   *
   * @param userId идентификатор пользователя
   * @param newsId идентификатор новости
   */
  setNewsViewed(userId: number, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.AUTH_USERS_URL}/${userId}/news/${newsId}/set_viewed/`,
      {}
    );
  }

  /**
   * Удаление новости из профиля.
   *
   * @param userId идентификатор пользователя
   * @param newsId идентификатор удаляемой новости
   */
  deleteNews(userId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`);
  }

  /**
   * Переключение лайка новости.
   *
   * @param userId идентификатор пользователя-владельца новости
   * @param newsId идентификатор новости
   * @param state новое состояние лайка
   */
  toggleLike(userId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  /**
   * Редактирование существующей новости.
   *
   * @param userId идентификатор пользователя
   * @param newsId идентификатор редактируемой новости
   * @param newsItem частичные данные для обновления новости
   */
  editNews(
    userId: string,
    newsId: number,
    newsItem: Partial<ProfileNews>
  ): Observable<ProfileNews> {
    return this.apiService.patch<ProfileNews>(
      `${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`,
      newsItem
    );
  }
}
