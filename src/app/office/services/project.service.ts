/** @format */

import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Project, ProjectCount } from "../models/project.model";
import { ApiService } from "../../core/services";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Project[]> {
    return this.apiService
      .get<Project[]>("/project/all")
      .pipe(map(projects => plainToClass(Project, projects)));
  }

  getOne(id: number): Observable<Project> {
    return this.apiService
      .get(`/project/${id}`)
      .pipe(map(project => plainToClass(Project, project)));
  }

  getMy(): Observable<Project[]> {
    return this.apiService
      .get<Project[]>("/project/my")
      .pipe(map(projects => plainToClass(Project, projects)));
  }

  getCount(): Observable<ProjectCount> {
    return this.apiService
      .get("/project/count")
      .pipe(map(count => plainToClass(ProjectCount, count)));
  }

  remove(projectId: number): Observable<void> {
    return this.apiService.delete(`/project/${projectId}`);
  }

  create(): Observable<Project> {
    return (
      this.apiService
        // TODO remove body after release
        .post("/project/create", Project.default())
        .pipe(map(project => plainToClass(Project, project)))
    );
  }
}
