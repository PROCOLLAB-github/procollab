/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Project, ProjectCount, ProjectStep } from "@models/project.model";
import { ApiService } from "projects/core";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private readonly apiService: ApiService) {}

  private readonly steps$ = new BehaviorSubject<ProjectStep[]>([]);
  steps = this.steps$.asObservable();

  getProjectSteps(): Observable<ProjectStep[]> {
    return this.apiService.get<[number, string][]>("/projects/steps/").pipe(
      map(steps => steps.map(step => ({ id: step[0], name: step[1] }))),
      map(steps => plainToInstance(ProjectStep, steps)),
      tap(steps => this.steps$.next(steps))
    );
  }

  getAll(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get<ApiPagination<Project>>("/projects/", params);
  }

  getOne(id: number): Observable<Project> {
    return this.apiService
      .get(`/projects/${id}/`)
      .pipe(map(project => plainToInstance(Project, project)));
  }

  getMy(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get<ApiPagination<Project>>("/auth/users/projects/", params);
  }

  projectsCount = new BehaviorSubject<ProjectCount>({ my: 0, all: 0, subs: 0 });
  projectsCount$ = this.projectsCount.asObservable();

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
