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
}
