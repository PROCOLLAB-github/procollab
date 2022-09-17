/** @format */

import { Injectable } from "@angular/core";
import { concatMap, map, Observable } from "rxjs";
import { Project, ProjectCount } from "../models/project.model";
import { ApiService } from "../../core/services";
import { plainToClass } from "class-transformer";
import { AuthService } from "../../auth/services";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  getAll(): Observable<Project[]> {
    return this.apiService
      .get<Project[]>("/project/all/")
      .pipe(map(projects => plainToClass(Project, projects)));
  }

  getOne(id: number): Observable<Project> {
    return this.apiService
      .get(`/project/${id}`)
      .pipe(map(project => plainToClass(Project, project)));
  }

  getMy(): Observable<Project[]> {
    return this.apiService
      .get<Project[]>("/project/my/")
      .pipe(map(projects => plainToClass(Project, projects)));
  }

  getCount(): Observable<ProjectCount> {
    return this.apiService
      .get("/project/count/")
      .pipe(map(count => plainToClass(ProjectCount, count)));
  }

  remove(projectId: number): Observable<void> {
    return this.apiService.delete(`/project/${projectId}`);
  }

  create(): Observable<Project> {
    return this.authService.profile.pipe(
      concatMap(profile => this.apiService.post("/project/create", { leaderId: profile.id })),
      map(project => plainToClass(Project, project))
    );
  }

  updateProject(projectId: number, newProject: Partial<Project>): Observable<Project> {
    return this.apiService
      .put(`/project/update/${projectId}`, newProject)
      .pipe(map(project => plainToClass(Project, project)));
  }
}
