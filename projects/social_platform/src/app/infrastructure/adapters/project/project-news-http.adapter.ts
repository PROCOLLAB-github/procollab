/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { FeedNews } from "../../../domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class ProjectNewsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   * Загружает список новостей проекта.
   *
   * @param projectId идентификатор проекта
   */
  fetchNews(projectId: string): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get<ApiPagination<FeedNews>>(
      `${this.PROJECTS_URL}/${projectId}/news/`,
      new HttpParams({ fromObject: { limit: 100 } })
    );
  }

  /**
   * Загружает детальную информацию о новости проекта.
   *
   * @param projectId идентификатор проекта
   * @param newsId идентификатор новости
   */
  fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews> {
    return this.apiService.get<FeedNews>(`${this.PROJECTS_URL}/${projectId}/news/${newsId}`);
  }

  /**
   * Создает новость проекта.
   *
   * @param projectId идентификатор проекта
   * @param obj объект с текстом и файлами
   */
  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService.post<FeedNews>(`${this.PROJECTS_URL}/${projectId}/news/`, obj);
  }

  /**
   * Отмечает новость проекта как просмотренную.
   *
   * @param projectId идентификатор проекта
   * @param newsId идентификатор новости
   */
  setNewsViewed(projectId: number, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.PROJECTS_URL}/${projectId}/news/${newsId}/set_viewed/`,
      {}
    );
  }

  /**
   * Удаляет новость проекта.
   *
   * @param projectId идентификатор проекта
   * @param newsId идентификатор новости
   */
  deleteNews(projectId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/`);
  }

  /**
   * Переключает лайк новости проекта.
   *
   * @param projectId идентификатор проекта
   * @param newsId идентификатор новости
   * @param state новое состояние лайка
   */
  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  /**
   * Редактирует новость проекта.
   *
   * @param projectId идентификатор проекта
   * @param newsId идентификатор новости
   * @param newsItem данные обновления
   */
  editNews(projectId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService.patch<FeedNews>(
      `${this.PROJECTS_URL}/${projectId}/news/${newsId}/`,
      newsItem
    );
  }
}
