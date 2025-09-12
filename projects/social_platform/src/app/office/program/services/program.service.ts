/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProgramCreate } from "@office/program/models/program-create.model";
import { Program, ProgramDataSchema, ProgramTag } from "@office/program/models/program.model";
import { Project } from "@models/project.model";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";

/**
 * Сервис для работы с программами
 *
 * Предоставляет методы для взаимодействия с API программ:
 * - Получение списка программ с пагинацией
 * - Получение детальной информации о программе
 * - Создание новой программы
 * - Регистрация в программе
 * - Получение проектов и участников программы
 * - Работа с тегами программ
 *
 * Принимает:
 * @param {ApiService} apiService - Сервис для HTTP запросов
 *
 * Методы:
 * @method getAll(skip: number, take: number) - Получает список программ с пагинацией
 * @method getOne(programId: number) - Получает детальную информацию о программе
 * @method create(program: ProgramCreate) - Создает новую программу
 * @method getDataSchema(programId: number) - Получает схему дополнительных полей программы
 * @method register(programId: number, additionalData: Record<string, string>) - Регистрирует пользователя в программе
 * @method getAllProjects(programId: number, offset: number, limit: number) - Получает проекты программы
 * @method getAllMembers(programId: number, skip: number, take: number) - Получает участников программы
 * @method submitCompettetiveProject(prelationId: number) - Cохранить и "подать проект" на сдачу в программу конкурсную
 * @method getProgramFilters(programId: number) - Получение данных для фильтра проектов-участников по доп полям
 * @method programTags() - Получает и кеширует теги программ пользователя
 *
 * Свойства:
 * @property {BehaviorSubject<ProgramTag[]>} programTags$ - Реактивный поток тегов программ
 */
@Injectable({
  providedIn: "root",
})
export class ProgramService {
  private readonly PROGRAMS_URL = "/programs";
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_PUBLIC_USERS_URL = "/auth/public-users";
  private readonly AUTH_USERS_CURRENT_URL = "/auth/users/current";

  constructor(private readonly apiService: ApiService) {}

  getAll(skip: number, take: number): Observable<ApiPagination<Program>> {
    return this.apiService.get(
      `${this.PROGRAMS_URL}/`,
      new HttpParams({ fromObject: { limit: take, offset: skip } })
    );
  }

  getOne(programId: number): Observable<Program> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/`);
  }

  create(program: ProgramCreate): Observable<Program> {
    return this.apiService.post(`${this.PROGRAMS_URL}/`, program);
  }

  getDataSchema(programId: number): Observable<ProgramDataSchema> {
    return this.apiService
      .get<{ dataSchema: ProgramDataSchema }>(`${this.PROGRAMS_URL}/${programId}/schema/`)
      .pipe(map(r => r["dataSchema"]));
  }

  register(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<ProgramDataSchema> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/register/`, additionalData);
  }

  getAllProjects(programId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/projects`, params);
  }

  getAllMembers(programId: number, skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get(
      `${this.AUTH_PUBLIC_USERS_URL}/`,
      new HttpParams({ fromObject: { partner_program: programId, limit: take, offset: skip } })
    );
  }

  getProgramFilters(programId: number): Observable<PartnerProgramFields[]> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/filters/`);
  }

  createProgramFilters(
    programId: number,
    filters: { filters: { string: string[] } }
  ): Observable<ApiPagination<Project>> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/projects/filter/`, {
      filters,
    });
  }

  submitCompettetiveProject(relationId: number): Observable<Project> {
    return this.apiService.post(
      `${this.PROGRAMS_URL}/partner-program-projects/${relationId}/submit/`,
      {}
    );
  }
}
