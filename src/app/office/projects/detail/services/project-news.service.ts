/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { forkJoin, map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ProjectNewsService {
  constructor(private readonly apiService: ApiService) {}

  fetchNews(projectId: string): Observable<ProjectNews[]> {
    return this.apiService
      .get<ProjectNews[]>(`/projects/${projectId}/news/`)
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

  like(projectId: string, newsId: number): Observable<void> {
    return this.apiService.post(`/projects/${projectId}/news/${newsId}/set_liked/`, {});
  }
}
