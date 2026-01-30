/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { map, Observable } from "rxjs";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";
import { plainToInstance } from "class-transformer";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { HttpParams } from "@angular/common/http";
import { CreateVacancyDto } from "../project/dto/create-vacancy.model";

/**
 * Сервис для управления вакансиями и откликами на них
 *
 * Предоставляет функциональность для:
 * - Получения списка вакансий с фильтрацией и поиском
 * - Создания, обновления и удаления вакансий
 * - Отправки откликов на вакансии
 * - Управления откликами (принятие/отклонение)
 * - Получения откликов по проектам
 */
@Injectable({
  providedIn: "root",
})
export class VacancyService {
  private readonly VACANCIES_URL = "/vacancies";
  private readonly PROJECTS_URL = "/projects";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список вакансий с расширенной фильтрацией
   * Поддерживает фильтрацию по опыту, формату работы, зарплате и поиск по тексту
   *
   * @param limit - максимальное количество вакансий на странице
   * @param offset - количество пропускаемых вакансий (для пагинации)
   * @param projectId - фильтр по идентификатору проекта (необязательно)
   * @param requiredExperience - фильтр по требуемому опыту работы (необязательно)
   * @param workFormat - фильтр по формату работы (удаленно/офис/гибрид) (необязательно)
   * @param workSchedule - фильтр по графику работы (полный день/частичная занятость) (необязательно)
   * @param salaryMin - минимальная зарплата для фильтрации (необязательно)
   * @param salaryMax - максимальная зарплата для фильтрации (необязательно)
   * @param searchValue - строка поиска по названию роли (необязательно)
   * @returns Observable<Vacancy[]> - массив вакансий, соответствующих критериям
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
  ): any {
    let params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());

    if (projectId !== undefined) {
      params = params.set("project_id", projectId.toString());
    }

    if (requiredExperience) {
      params = params.set("required_experience", requiredExperience);
    }

    if (workFormat) {
      params = params.set("work_format", workFormat);
    }

    if (workSchedule) {
      params = params.set("work_schedule", workSchedule);
    }

    if (salary) {
      params = params.set("salary", salary);
    }

    if (searchValue) {
      params = params.set("role_contains", searchValue);
    }

    return this.apiService
      .get<Vacancy[]>(`${this.VACANCIES_URL}/`, params)
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));
  }

  /**
   * Получает список откликов текущего пользователя на вакансии
   *
   * @param limit - максимальное количество откликов на странице
   * @param offset - количество пропускаемых откликов (для пагинации)
   * @returns Observable<VacancyResponse[]> - массив откликов пользователя с информацией о вакансиях
   */
  getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]> {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<VacancyResponse[]>(`${this.VACANCIES_URL}/responses/self`, params)
      .pipe(map(vacancies => plainToInstance(VacancyResponse, vacancies)));
  }

  /**
   * Получает детальную информацию о конкретной вакансии
   *
   * @param vacancyId - идентификатор вакансии
   * @returns Observable<Vacancy> - объект вакансии со всеми полями
   */
  getOne(vacancyId: number) {
    return this.apiService
      .get(`${this.VACANCIES_URL}/${vacancyId}`)
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  /**
   * Создает новую вакансию для проекта
   *
   * @param projectId - идентификатор проекта, к которому привязывается вакансия
   * @param vacancy - объект вакансии с описанием, требованиями и условиями
   * @returns Observable<Vacancy> - созданная вакансия со всеми полями
   */
  postVacancy(projectId: number, vacancy: CreateVacancyDto): Observable<Vacancy> {
    return this.apiService
      .post(`${this.VACANCIES_URL}/`, {
        ...vacancy,
        project: projectId,
      })
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
  }

  /**
   * Обновляет существующую вакансию
   *
   * @param vacancyId - идентификатор вакансии для обновления
   * @param vacancy - объект с обновленными данными вакансии
   * @returns Observable<Vacancy> - обновленная вакансия
   */
  updateVacancy(vacancyId: number, vacancy: Vacancy) {
    return this.apiService.patch(`${this.VACANCIES_URL}/${vacancyId}`, { ...vacancy });
  }

  /**
   * Удаляет вакансию
   *
   * @param vacancyId - идентификатор вакансии для удаления
   * @returns Observable<void> - завершается при успешном удалении
   */
  deleteVacancy(vacancyId: number): Observable<void> {
    return this.apiService.delete(`${this.VACANCIES_URL}/${vacancyId}`);
  }

  /**
   * Отправляет отклик на вакансию
   *
   * @param vacancyId - идентификатор вакансии
   * @param body - объект с мотивационным письмом (поле whyMe)
   * @returns Observable<void> - завершается при успешной отправке отклика
   */
  sendResponse(vacancyId: number, body: { whyMe: string }): Observable<void> {
    return this.apiService.post(`${this.VACANCIES_URL}/${vacancyId}/responses/`, body);
  }

  /**
   * Получает все отклики на вакансии конкретного проекта
   *
   * @param projectId - идентификатор проекта
   * @returns Observable<VacancyResponse[]> - массив откликов с информацией о кандидатах
   */
  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.apiService
      .get<VacancyResponse[]>(`${this.PROJECTS_URL}/${projectId}/responses/`)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  /**
   * Принимает отклик кандидата на вакансию
   *
   * @param responseId - идентификатор отклика
   * @returns Observable<void> - завершается при успешном принятии отклика
   */
  acceptResponse(responseId: number): Observable<void> {
    return this.apiService.post(`${this.VACANCIES_URL}/responses/${responseId}/accept/`, {});
  }

  /**
   * Отклоняет отклик кандидата на вакансию
   *
   * @param responseId - идентификатор отклика
   * @returns Observable<void> - завершается при успешном отклонении отклика
   */
  rejectResponse(responseId: number): Observable<void> {
    return this.apiService.post(`${this.VACANCIES_URL}/responses/${responseId}/decline/`, {});
  }
}
