/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { map, Observable } from "rxjs";
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

  delete(projectId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`/projects/${projectId}/news/${newsId}/`);
  }
}
