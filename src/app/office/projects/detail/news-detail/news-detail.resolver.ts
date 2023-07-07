/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProjectNews } from "@office/projects/models/project-news.model";

@Injectable({
  providedIn: "root",
})
export class NewsDetailResolver implements Resolve<ProjectNews> {
  constructor(private readonly projectNewsService: ProjectNewsService) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<ProjectNews> {
    const projectId = route.parent?.params.projectId;
    const newsId = route.params.newsId;
    return this.projectNewsService.fetchNewsDetail(projectId, newsId);
  }
}
