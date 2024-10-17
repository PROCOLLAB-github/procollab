/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { forkJoin, Observable } from "rxjs";
import { ApiPagination } from "@models/api-pagination.model";
import { FeedNews } from "@office/projects/models/project-news.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProgramNewsService {
  constructor(private readonly apiService: ApiService) {}

  fetchNews(limit: number, offset: number, programId: number): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get(
      `/programs/${programId}/news/`,
      new HttpParams({ fromObject: { limit, offset } })
    );
  }

  readNews(projectId: string, newsIds: number[]): Observable<void[]> {
    return forkJoin(
      newsIds.map(id =>
        this.apiService.post<void>(`/programs/${projectId}/news/${id}/set_viewed/`, {})
      )
    );
  }

  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`/programs/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }
}
