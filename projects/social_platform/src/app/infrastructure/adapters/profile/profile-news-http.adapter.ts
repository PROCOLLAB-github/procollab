/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProfileNews } from "@domain/profile/profile-news.model";

/** HTTP-адаптер новостей профиля: `/auth/users/<id>/news`. */
@Injectable({ providedIn: "root" })
export class ProfileNewsHttpAdapter {
  private readonly AUTH_USERS_URL = "/auth/users";
  private readonly apiService = inject(ApiService);

  fetchNews(userId: string): Observable<ApiPagination<ProfileNews>> {
    return this.apiService.get<ApiPagination<ProfileNews>>(
      `${this.AUTH_USERS_URL}/${userId}/news/`,
      new HttpParams({ fromObject: { limit: 10 } })
    );
  }

  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews> {
    return this.apiService.get<ProfileNews>(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`);
  }

  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews> {
    return this.apiService.post<ProfileNews>(`${this.AUTH_USERS_URL}/${userId}/news/`, obj);
  }

  setNewsViewed(userId: number, newsId: number): Observable<void> {
    return this.apiService.post<void>(
      `${this.AUTH_USERS_URL}/${userId}/news/${newsId}/set_viewed/`,
      {}
    );
  }

  deleteNews(userId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/`);
  }

  toggleLike(userId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/${userId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

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
