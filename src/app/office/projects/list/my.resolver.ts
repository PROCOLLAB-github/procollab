/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProjectsMyResolver implements Resolve<ApiPagination<Project>> {
  constructor(private readonly projectService: ProjectService) {}

  resolve(): Observable<ApiPagination<Project>> {
    return this.projectService.getMy(new HttpParams({ fromObject: { limit: 16 } }));
  }
}
