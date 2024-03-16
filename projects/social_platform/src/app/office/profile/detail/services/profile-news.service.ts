/** @format */

import { inject, Injectable } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { ApiService } from "projects/core";
import { ProfileNews } from "../models/profile-news.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { StorageService } from "@services/storage.service";
import { ApiPagination } from "@models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class ProfileNewsService {
  storageService = inject(StorageService);
  apiService = inject(ApiService);

  fetchNews(userId: string): Observable<ApiPagination<ProfileNews>> {
    return this.apiService.get<ApiPagination<ProfileNews>>(
      `/auth/users/${userId}/news/`,
      new HttpParams({ fromObject: { limit: 10 } })
    );
  }

  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews> {
    return this.apiService
      .get<ProfileNews>(`/auth/users/${userId}/news/${newsId}`)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }

  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews> {
    return this.apiService
      .post(`/auth/users/${userId}/news/`, obj)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }

  readNews(userId: number, newsIds: number[]): Observable<void[]> {
    const readNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];

    return forkJoin(
      newsIds
        .filter(id => !readNews.includes(id))
        .map(id =>
          this.apiService.post<void>(`/auth/users/${userId}/news/${id}/set_viewed/`, {}).pipe(
            tap(() => {
              this.storageService.setItem("readNews", [...readNews, id], sessionStorage);
            })
          )
        )
    );
  }

  delete(userId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`/auth/users/${userId}/news/${newsId}/`);
  }

  toggleLike(userId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`/auth/users/${userId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  editNews(
    userId: string,
    newsId: number,
    newsItem: Partial<ProfileNews>
  ): Observable<ProfileNews> {
    return this.apiService
      .patch(`/auth/users/${userId}/news/${newsId}/`, newsItem)
      .pipe(map(r => plainToInstance(ProfileNews, r)));
  }
}
