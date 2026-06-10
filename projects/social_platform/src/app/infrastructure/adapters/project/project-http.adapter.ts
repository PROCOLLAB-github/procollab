/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ProjectCountDto, ProjectDto, ProjectListDto } from "./dto/project.dto";

/** HTTP-адаптер проектов: `/projects`, `/auth/users` (CRUD, счётчики, проекты лидера). */
@Injectable({ providedIn: "root" })
export class ProjectHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_USERS_URL = "/auth/users";

  private readonly apiService = inject(ApiService);

  fetchAll(params?: HttpParams): Observable<ProjectListDto> {
    return this.apiService.get<ProjectListDto>(`${this.PROJECTS_URL}/`, params);
  }

  fetchOne(id: number): Observable<ProjectDto> {
    return this.apiService.get<ProjectDto>(`${this.PROJECTS_URL}/${id}/`);
  }

  fetchCount(): Observable<ProjectCountDto> {
    return this.apiService.get<ProjectCountDto>(`${this.PROJECTS_URL}/count/`);
  }

  postCreate(): Observable<ProjectDto> {
    return this.apiService.post<ProjectDto>(`${this.PROJECTS_URL}/`, {});
  }

  putUpdate(id: number, data: Partial<ProjectDto>): Observable<ProjectDto> {
    return this.apiService.put<ProjectDto>(`${this.PROJECTS_URL}/${id}/`, data);
  }

  deleteOne(id: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${id}/`);
  }

  fetchMy(params?: HttpParams): Observable<ProjectListDto> {
    return this.apiService.get<ProjectListDto>(`${this.AUTH_USERS_URL}/projects/`, params);
  }
}
