/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { FeedNews } from "../../../domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class ProgramNewsHttpAdapter {
  private readonly PROGRAMS_URL = "/programs";
  private readonly apiService = inject(ApiService);

  /**
   * Загружает новости программы с пагинацией.
   *
   * @param limit лимит записей
   * @param offset смещение
   * @param programId идентификатор программы
   */
  fetchNews(limit: number, offset: number, programId: number): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get(
      `${this.PROGRAMS_URL}/${programId}/news/`,
      new HttpParams({ fromObject: { limit, offset } })
    );
  }

  /**
   * Отмечает новость программы как прочитанную.
   *
   * @param programId идентификатор программы
   * @param newsId идентификатор новости
   */
  setNewsViewed(programId: string, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.PROGRAMS_URL}/${programId}/news/${newsId}/set_viewed/`,
      {}
    );
  }

  /**
   * Переключает лайк новости программы.
   *
   * @param programId идентификатор программы
   * @param newsId идентификатор новости
   * @param state новое состояние лайка
   */
  toggleLike(programId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  /**
   * Добавляет новость программы.
   *
   * @param programId идентификатор программы
   * @param obj объект с текстом и файлами
   */
  addNews(programId: number, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService.post<FeedNews>(`${this.PROGRAMS_URL}/${programId}/news/`, obj);
  }

  /**
   * Редактирует новость программы.
   *
   * @param programId идентификатор программы
   * @param newsId идентификатор новости
   * @param newsItem данные обновления
   */
  editNews(programId: number, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService.patch<FeedNews>(
      `${this.PROGRAMS_URL}/${programId}/news/${newsId}`,
      newsItem
    );
  }

  /**
   * Удаляет новость программы.
   *
   * @param programId идентификатор программы
   * @param newsId идентификатор новости
   */
  deleteNews(programId: number, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.PROGRAMS_URL}/${programId}/news/${newsId}`);
  }
}
