/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { FeedNews, ProjectNewsRes } from "@office/projects/models/project-news.model";
import { forkJoin, map, Observable, tap } from "rxjs";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";
import { StorageService } from "@services/storage.service";

@Injectable({
  providedIn: "root",
})
export class ProjectNewsService {
  storageService = inject(StorageService);
  apiService = inject(ApiService);

  fetchNews(projectId: string): Observable<ProjectNewsRes> {
    return this.apiService.get<ProjectNewsRes>(
      `/projects/${projectId}/news/`,
      new HttpParams({ fromObject: { limit: 100 } })
    );
  }

  fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews> {
    return this.apiService
      .get<FeedNews>(`/projects/${projectId}/news/${newsId}`)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }

  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService
      .post(`/projects/${projectId}/news/`, obj)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }

  readNews(projectId: number, newsIds: number[]): Observable<void[]> {
    const readNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];

    return forkJoin(
      newsIds
        .filter(id => !readNews.includes(id))
        .map(id =>
          this.apiService.post<void>(`/projects/${projectId}/news/${id}/set_viewed/`, {}).pipe(
            tap(() => {
              this.storageService.setItem("readNews", [...readNews, id], sessionStorage);
            })
          )
        )
    );
  }

  delete(projectId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`/projects/${projectId}/news/${newsId}/`);
  }

  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`/projects/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  editNews(projectId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService
      .patch(`/projects/${projectId}/news/${newsId}/`, newsItem)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }
}
