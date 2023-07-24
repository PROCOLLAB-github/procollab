/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ProjectNewsRes } from "@office/projects/models/project-news.model";

@Injectable({
  providedIn: "root",
})
export class ProgramNewsService {
  constructor(private readonly apiService: ApiService) {}

  fetchNews(programId: number): Observable<ProjectNewsRes> {
    return this.apiService.get(`/programs/${programId}/news/`);
  }
}
