/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { VacancyResponse } from "../../../domain/vacancy/vacancy-response.model";
import { CreateVacancyDto } from "../../../api/project/dto/create-vacancy.model";

@Injectable({ providedIn: "root" })
export class VacancyHttpAdapter {
  private readonly VACANCIES_URL = "/vacancies";
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   * Получает список вакансий с фильтрацией и поиском.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  getForProject(
    limit: number,
    offset: number,
    projectId?: number,
    requiredExperience?: string,
    workFormat?: string,
    workSchedule?: string,
    salary?: string,
    searchValue?: string
  ): Observable<Vacancy[]> {
    let params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());

    if (projectId !== undefined) params = params.set("project_id", projectId.toString());
    if (requiredExperience) params = params.set("required_experience", requiredExperience);
    if (workFormat) params = params.set("work_format", workFormat);
    if (workSchedule) params = params.set("work_schedule", workSchedule);
    if (salary) params = params.set("salary", salary);
    if (searchValue) params = params.set("role_contains", searchValue);

    return this.apiService.get<Vacancy[]>(`${this.VACANCIES_URL}/`, params);
  }

  /**
   * Получает список откликов текущего пользователя.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]> {
    const params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());
    return this.apiService.get<VacancyResponse[]>(`${this.VACANCIES_URL}/responses/self`, params);
  }

  /**
   * Получает вакансию по идентификатору.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  getOne(vacancyId: number): Observable<Vacancy> {
    return this.apiService.get<Vacancy>(`${this.VACANCIES_URL}/${vacancyId}`);
  }

  /**
   * Создает вакансию для проекта.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  postVacancy(projectId: number, vacancy: CreateVacancyDto): Observable<Vacancy> {
    return this.apiService.post<Vacancy>(`${this.VACANCIES_URL}/`, {
      ...vacancy,
      project: projectId,
    });
  }

  /**
   * Обновляет вакансию.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  updateVacancy(
    vacancyId: number,
    vacancy: Partial<Vacancy> | CreateVacancyDto
  ): Observable<Vacancy> {
    return this.apiService.patch<Vacancy>(`${this.VACANCIES_URL}/${vacancyId}`, { ...vacancy });
  }

  /**
   * Удаляет вакансию.
   */
  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`${this.VACANCIES_URL}/${vacancyId}`);
  }

  /**
   * Отправляет отклик на вакансию и возвращает данные созданного отклика.
   */
  sendResponse(vacancyId: number, body: { whyMe: string }): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/${vacancyId}/responses/`,
      body
    );
  }

  /**
   * Получает отклики по проекту.
   * Возвращает сырой HTTP-ответ без доменного маппинга.
   */
  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.apiService.get<VacancyResponse[]>(`${this.PROJECTS_URL}/${projectId}/responses/`);
  }

  /**
   * Принимает отклик и возвращает обновленные данные отклика.
   */
  acceptResponse(responseId: number): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/responses/${responseId}/accept/`,
      {}
    );
  }

  /**
   * Отклоняет отклик и возвращает обновленные данные отклика.
   */
  rejectResponse(responseId: number): Observable<VacancyResponse> {
    return this.apiService.post<VacancyResponse>(
      `${this.VACANCIES_URL}/responses/${responseId}/decline/`,
      {}
    );
  }
}
