/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ProjectCountDto, ProjectDto, ProjectListDto } from "./dto/project.dto";

@Injectable({ providedIn: "root" })
export class ProjectHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_USERS_URL = "/auth/users";

  private readonly apiService = inject(ApiService);

  /**
   * Получает список всех проектов с пагинацией
   *
   * @param params - HttpParams с параметрами запроса (limit, offset, фильтры)
   * @returns Observable<ProjectListDto> - объект с массивом проектов и метаданными пагинации
   */
  fetchAll(params?: HttpParams): Observable<ProjectListDto> {
    return this.apiService.get<ProjectListDto>(`${this.PROJECTS_URL}/`, params);
  }

  /**
   * Получает один проект по его идентификатору
   *
   * @param id - уникальный идентификатор проекта
   * @returns Observable<ProjectDto> - сырой DTO проекта со всеми полями
   */
  fetchOne(id: number): Observable<ProjectDto> {
    return this.apiService.get<ProjectDto>(`${this.PROJECTS_URL}/${id}/`);
  }

  /**
   * Получает статистику по количеству проектов
   *
   * @returns Observable<ProjectCountDto> - объект с полями my, all, subs (количество проектов)
   */
  fetchCount(): Observable<ProjectCountDto> {
    return this.apiService.get<ProjectCountDto>(`${this.PROJECTS_URL}/count/`);
  }

  /**
   * Создает новый пустой проект
   *
   * @returns Observable<ProjectDto> - созданный проект со всеми полями
   */
  postCreate(): Observable<ProjectDto> {
    return this.apiService.post<ProjectDto>(`${this.PROJECTS_URL}/`, {});
  }

  /**
   * Обновляет существующий проект
   *
   * @param id - идентификатор проекта для обновления
   * @param data - объект с полями проекта для обновления (частичный)
   * @returns Observable<ProjectDto> - обновленный проект со всеми полями
   */
  putUpdate(id: number, data: Partial<ProjectDto>): Observable<ProjectDto> {
    return this.apiService.put<ProjectDto>(`${this.PROJECTS_URL}/${id}/`, data);
  }

  /**
   * Удаляет проект по его идентификатору
   *
   * @param id - уникальный идентификатор проекта для удаления
   * @returns Observable<void> - завершается при успешном удалении
   */
  deleteOne(id: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${id}/`);
  }

  /**
   * Получает список проектов текущего пользователя с пагинацией
   *
   * @param params - HttpParams с параметрами запроса (limit, offset, фильтры)
   * @returns Observable<ProjectListDto> - объект с массивом проектов пользователя и метаданными пагинации
   */
  fetchMy(params?: HttpParams): Observable<ProjectListDto> {
    return this.apiService.get<ProjectListDto>(`${this.AUTH_USERS_URL}/projects/`, params);
  }
}
