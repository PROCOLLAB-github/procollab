/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Project, ProjectCount, ProjectStep } from "@models/project.model";
import { ApiService } from "projects/core";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectAssign } from "@office/projects/models/project-assign.model";
import { projectNewAdditionalProgramVields } from "@office/models/partner-program-fields.model";
import { Goal, GoalPostForm } from "@office/models/goals.model";
import { Partner, PartnerPostForm } from "@office/models/partner.model";
import { Resource, ResourcePostForm } from "@office/models/resource.model";

/**
 * Сервис для управления проектами
 *
 * Предоставляет функциональность для:
 * - Получения списка проектов с пагинацией
 * - Создания, обновления и удаления проектов
 * - Управления этапами проектов
 * - Работы с коллабораторами проектов
 * - Получения статистики по проектам
 */
@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_USERS_URL = "/auth/users";

  constructor(private readonly apiService: ApiService) {}

  /**
   * BehaviorSubject для хранения этапов проектов
   * Используется для кеширования и реактивного обновления данных об этапах
   */
  readonly steps$ = new BehaviorSubject<ProjectStep[]>([]);

  /**
   * Получает список всех проектов с пагинацией
   *
   * @param params - HttpParams с параметрами запроса (limit, offset, фильтры)
   * @returns Observable<ApiPagination<Project>> - объект с массивом проектов и метаданными пагинации
   */
  getAll(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get<ApiPagination<Project>>(`${this.PROJECTS_URL}/`, params);
  }

  /**
   * Получает один проект по его идентификатору
   * Преобразует полученные данные в экземпляр класса Project
   *
   * @param id - уникальный идентификатор проекта
   * @returns Observable<Project> - объект проекта со всеми полями
   */
  getOne(id: number): Observable<Project> {
    return this.apiService
      .get(`${this.PROJECTS_URL}/${id}/`)
      .pipe(map(project => plainToInstance(Project, project)));
  }

  /**
   * Получает список проектов текущего пользователя с пагинацией
   *
   * @param params - HttpParams с параметрами запроса (limit, offset, фильтры)
   * @returns Observable<ApiPagination<Project>> - объект с массивом проектов пользователя и метаданными пагинации
   */
  getMy(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get<ApiPagination<Project>>(`${this.AUTH_USERS_URL}/projects/`, params);
  }

  /**
   *
   * @param projectId
   * @param params
   * @returns Создать или привязать компанию к проекту.
   * Если компания с таким ИНН уже существует — создаёт или обновляет связь ProjectCompany.
   * Если компании нет — создаёт новую и тут же привязывает.
   */
  addPartner(projectId: number, params: PartnerPostForm) {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/companies/`, params);
  }

  /**
   * Получить список всех компаний-партнёров (связей ProjectCompany) конкретного проекта.
   *
   * @param projectId
   *
   * @returns данные компании
   * @returns вклад
   * @returns ответственного
   */
  getPartners(projectId: number): Observable<Partner[]> {
    return this.apiService.get(`${this.PROJECTS_URL}/${projectId}/companies/list/`);
  }

  /**
   * @param projectId
   * @param companyId
   *
   * @returns Обновить информацию о связи проекта с компанией.
   * Можно изменить вклад (contribution) и/или ответственное лицо (decision_maker).
   * Компания остаётся без изменений.
   */
  editParter(
    projectId: number,
    companyId: number,
    params: Pick<PartnerPostForm, "contribution" | "decisionMaker">
  ) {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/companies/${companyId}/`,
      params
    );
  }

  /**
   * @param projectId
   * @param companyId
   *
   * @returns Удалить связь проекта с компанией. Компания в базе остаётся, удаляется только запись ProjectCompany.
   */
  deletePartner(projectId: number, companyId: number) {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/companies/${companyId}/`);
  }

  /**
   *
   * @param projectId
   * @param params
   * @returns Создать новый ресурс в проекте.
   * Если partner_company указана, проверяется, что она действительно является партнёром данного проекта.
   */
  addResource(projectId: number, params: Omit<ResourcePostForm, "projectId">) {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/resources/`, {
      project_id: projectId,
      ...params,
    });
  }

  /**
   *
   * @param projectId
   * @returns Получить список всех ресурсов проекта.
   * Каждый ресурс содержит тип, описание и партнёра (если назначен)
   */
  getResources(projectId: number): Observable<Resource[]> {
    return this.apiService.get(`${this.PROJECTS_URL}/${projectId}/resources/`);
  }

  /**
   * @param projectId
   * @param resourceId
   *
   * @returns Полностью обновить данные ресурса.
   * Используется, если нужно заменить все поля сразу.
   */
  editResource(projectId: number, resourceId: number, params: Omit<ResourcePostForm, "projectId">) {
    return this.apiService.patch(`${this.PROJECTS_URL}/${projectId}/resources/${resourceId}/`, {
      project_id: projectId,
      ...params,
    });
  }

  /**
   * @param projectId
   * @param resourceId
   *
   * @returns Удалить ресурс проекта.
   * Удаляется только сам ресурс, проект и компании не затрагиваются.
   */
  deleteResource(projectId: number, resourceId: number) {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/resources/${resourceId}/`);
  }

  /**
   * Получает список целей проекта
   *
   * @returns Observable<Goal> - объект с массивом целей проекта
   */
  getGoals(projectId: number): Observable<Goal[]> {
    return this.apiService.get<Goal[]>(`${this.PROJECTS_URL}/${projectId}/goals/`);
  }

  /**
   * Отправляем цель
   */
  addGoals(projectId: number, params: GoalPostForm[]) {
    return this.apiService.post<GoalPostForm[]>(`${this.PROJECTS_URL}/${projectId}/goals/`, params);
  }

  /**
   * Редактирование цели
   */
  editGoal(projectId: number, goalId: number, params: GoalPostForm) {
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/goals/${goalId}`, params);
  }

  /**
   * Удаляем цель
   */
  deleteGoals(projectId: number, goalId: number) {
    return this.apiService.delete<GoalPostForm>(
      `${this.PROJECTS_URL}/${projectId}/goals/${goalId}`
    );
  }

  /**
   * BehaviorSubject для хранения счетчиков проектов
   * Содержит количество собственных проектов, всех проектов и подписок
   */
  projectsCount = new BehaviorSubject<ProjectCount>({ my: 0, all: 0, subs: 0 });

  /**
   * Observable для подписки на изменения счетчиков проектов
   * @returns Observable<ProjectCount> - объект с количеством проектов разных типов
   */
  projectsCount$ = this.projectsCount.asObservable();

  /**
   * Получает статистику по количеству проектов
   * Преобразует данные в экземпляр класса ProjectCount
   *
   * @returns Observable<ProjectCount> - объект с полями my, all, subs (количество проектов)
   */
  getCount(): Observable<ProjectCount> {
    return this.apiService
      .get(`${this.PROJECTS_URL}/count/`)
      .pipe(map(count => plainToInstance(ProjectCount, count)));
  }

  /**
   * Удаляет проект по его идентификатору
   *
   * @param projectId - уникальный идентификатор проекта для удаления
   * @returns Observable<void> - завершается при успешном удалении
   */
  remove(projectId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/`);
  }

  /**
   * Покидает проект (удаляет текущего пользователя из коллабораторов)
   *
   * @param projectId - идентификатор проекта, который нужно покинуть
   * @returns Observable<void> - завершается при успешном выходе из проекта
   */
  leave(projectId: Project["id"]): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators/leave`);
  }

  /**
   * Создает новый пустой проект
   * Преобразует полученные данные в экземпляр класса Project
   *
   * @returns Observable<Project> - созданный проект со всеми полями
   */
  create(): Observable<Project> {
    return this.apiService
      .post(`${this.PROJECTS_URL}/`, {})
      .pipe(map(project => plainToInstance(Project, project)));
  }

  /**
   * Ссоздаёт привязывает проект к программе с указанным ID.
   * После чего в БД появляется новый проект в черновиках
   *
   * @param projectId - идентификатор проекта
   * @param partnerProgramId - идентификатор программы, к которой привязывается проект
   * @returns Observable<ProjectAssign> - ответ с названием программы и инфой краткой о проекте
   */
  assignProjectToProgram(projectId: number, partnerProgramId: number): Observable<ProjectAssign> {
    return this.apiService.post(`${this.PROJECTS_URL}/assign-to-program/`, {
      project_id: projectId,
      partner_program_id: partnerProgramId,
    });
  }

  /**
   * Ссоздаёт привязывает проект к программе с указанным ID.
   * После чего в БД появляется новый проект в черновиках
   *
   * @param projectId - id проекта
   * @param fieldId - идентификатор доп поля
   * @param valueText - идентификатор программы, к которой привязывается проект
   * @returns Observable<Project> - измененный проект
   */
  sendNewProjectFieldsValues(
    projectId: number,
    newValues: projectNewAdditionalProgramVields[]
  ): Observable<Project> {
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/program-fields/`, newValues);
  }

  /**
   * Обновляет существующий проект
   * Отправляет частичные данные проекта для обновления
   *
   * @param projectId - идентификатор проекта для обновления
   * @param newProject - объект с полями проекта для обновления (частичный)
   * @returns Observable<Project> - обновленный проект со всеми полями
   */
  updateProject(projectId: number, newProject: Partial<Project>): Observable<Project> {
    return this.apiService
      .put(`${this.PROJECTS_URL}/${projectId}/`, newProject)
      .pipe(map(project => plainToInstance(Project, project)));
  }

  /**
   * Удаляет коллаборатора из проекта
   *
   * @param projectId - идентификатор проекта
   * @param userId - идентификатор пользователя для удаления из коллабораторов
   * @returns Observable<void> - завершается при успешном удалении коллаборатора
   */
  removeColloborator(projectId: Project["id"], userId: Collaborator["userId"]): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators?id=${userId}`);
  }

  /**
   * Передает лидерство в проекте другому пользователю
   *
   * @param projectId - идентификатор проекта
   * @param userId - идентификатор пользователя, которому передается лидерство
   * @returns Observable<void> - завершается при успешной передаче лидерства
   */
  switchLeader(projectId: Project["id"], userId: Collaborator["userId"]): Observable<void> {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/collaborators/${userId}/switch-leader/`,
      {}
    );
  }
}
