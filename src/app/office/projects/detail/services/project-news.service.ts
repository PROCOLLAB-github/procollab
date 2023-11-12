/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { ProjectNews, ProjectNewsRes } from "@office/projects/models/project-news.model";
import { forkJoin, map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProjectNewsService {
  constructor(private readonly apiService: ApiService) {}

  fetchNews(projectId: string): Observable<ProjectNewsRes> {
    return this.apiService.get<ProjectNewsRes>(
      `/projects/${projectId}/news/`,
      new HttpParams({ fromObject: { limit: 100 } })
    );
  }

  fetchNewsDetail(projectId: string, newsId: string): Observable<ProjectNews> {
    return this.apiService
      .get<ProjectNews>(`/projects/${projectId}/news/${newsId}`)
      .pipe(map(r => plainToInstance(ProjectNews, r)));
  }

  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<ProjectNews> {
    return this.apiService
      .post(`/projects/${projectId}/news/`, obj)
      .pipe(map(r => plainToInstance(ProjectNews, r)));
  }

  readNews(projectId: string, newsIds: number[]): Observable<void[]> {
    return forkJoin(
      newsIds.map(id =>
        this.apiService.post<void>(`/projects/${projectId}/news/${id}/set_viewed/`, {})
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

  editNews(
    projectId: string,
    newsId: number,
    newsItem: Partial<ProjectNews>
  ): Observable<ProjectNews> {
    return this.apiService
      .patch(`/projects/${projectId}/news/${newsId}/`, newsItem)
      .pipe(map(r => plainToInstance(ProjectNews, r)));
  }
}
