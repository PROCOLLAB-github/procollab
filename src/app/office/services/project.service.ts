/** @format */

import { Injectable } from "@angular/core";
import { concatMap, map, Observable, take } from "rxjs";
import { Project, ProjectCount } from "../models/project.model";
import { ApiService } from "../../core/services";
import { plainToInstance } from "class-transformer";
import { AuthService } from "../../auth/services";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  getAll(): Observable<Project[]> {
    return this.apiService
      .get<Project[]>("/projects/")
      .pipe(map(projects => plainToInstance(Project, projects)));
  }

  getOne(id: number): Observable<Project> {
    return this.apiService
      .get(`/projects/${id}/`)
      .pipe(map(project => plainToInstance(Project, project)));
  }

  getMy(): Observable<Project[]> {
    return this.authService.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.get<Project[]>(
          "/auth/users/drafts/",
          new HttpParams({ fromObject: { leader_id: profile.id } })
        )
      ),
      map(projects => plainToInstance(Project, projects))
    );
  }

  getCount(): Observable<ProjectCount> {
    return this.apiService
      .get("/projects/count/")
      .pipe(map(count => plainToInstance(ProjectCount, count)));
  }

  remove(projectId: number): Observable<void> {
    return this.apiService.delete(`/projects/${projectId}/`);
  }

  create(): Observable<Project> {
    return this.apiService
      .post("/projects/", {})
      .pipe(map(project => plainToInstance(Project, project)));
  }

  updateProject(projectId: number, newProject: Partial<Project>): Observable<Project> {
    return this.apiService
      .put(`/projects/${projectId}/`, newProject)
      .pipe(map(project => plainToInstance(Project, project)));
  }
}
