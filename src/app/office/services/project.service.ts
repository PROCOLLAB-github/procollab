/** @format */

import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Project } from "../models/project.model";
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
}
