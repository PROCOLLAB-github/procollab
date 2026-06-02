/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";

/** HTTP-адаптер новостей программы: `/programs/<id>/news`. */
@Injectable({ providedIn: "root" })
export class ProgramNewsHttpAdapter {
  private readonly PROGRAMS_URL = "/programs";
  private readonly apiService = inject(ApiService);

  fetchNews(programId: number, limit: number, offset: number): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get(
      `${this.PROGRAMS_URL}/${programId}/news/`,
      new HttpParams({ fromObject: { limit, offset } }),
    );
  }

  setNewsViewed(programId: string, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.PROGRAMS_URL}/${programId}/news/${newsId}/set_viewed/`,
      {},
    );
  }

  toggleLike(programId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  addNews(programId: number, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService.post<FeedNews>(`${this.PROGRAMS_URL}/${programId}/news/`, obj);
  }

  editNews(programId: number, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService.patch<FeedNews>(
      `${this.PROGRAMS_URL}/${programId}/news/${newsId}/`,
      newsItem,
    );
  }

  deleteNews(programId: number, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.PROGRAMS_URL}/${programId}/news/${newsId}/`);
  }
}
