/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";

/** HTTP-адаптер новостей проекта: `/projects/<id>/news`. */
@Injectable({ providedIn: "root" })
export class ProjectNewsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  fetchNews(projectId: string): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get<ApiPagination<FeedNews>>(
      `${this.PROJECTS_URL}/${projectId}/news/`,
      new HttpParams({ fromObject: { limit: 100 } }),
    );
  }

  fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews> {
    return this.apiService.get<FeedNews>(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/`);
  }

  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService.post<FeedNews>(`${this.PROJECTS_URL}/${projectId}/news/`, obj);
  }

  setNewsViewed(projectId: number, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.PROJECTS_URL}/${projectId}/news/${newsId}/set_viewed/`,
      {},
    );
  }

  deleteNews(projectId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/`);
  }

  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  editNews(projectId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService.patch<FeedNews>(
      `${this.PROJECTS_URL}/${projectId}/news/${newsId}/`,
      newsItem,
    );
  }
}
