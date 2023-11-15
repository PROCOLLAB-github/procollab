/** @format */

import { Injectable } from "@angular/core";
import { Observable, map, forkJoin } from "rxjs";
import { ApiService } from "@core/services";
import { ProfileNews, ProfileNewsRes } from "../models/profile-news.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class ProfileNewsService {
  constructor(private readonly apiService: ApiService) {}

  fetchNews(userId: string): Observable<ProfileNewsRes> {
    return this.apiService.get<ProfileNewsRes>(
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

  readNews(userId: string, newsIds: number[]): Observable<void[]> {
    return forkJoin(
      newsIds.map(id =>
        this.apiService.post<void>(`/auth/users/${userId}/news/${id}/set_viewed/`, {})
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
