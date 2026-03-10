/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { User } from "../../../domain/auth/user.model";
import { PartnerProgramFields } from "../../../domain/program/partner-program-fields.model";
import { Program, ProgramDataSchema } from "../../../domain/program/program.model";
import { ProgramCreate } from "../../../domain/program/program-create.model";
import { Project } from "../../../domain/project/project.model";
import { ProjectAdditionalFields } from "../../../domain/project/project-additional-fields.model";

@Injectable({ providedIn: "root" })
export class ProgramHttpAdapter {
  private readonly PROGRAMS_URL = "/programs";
  private readonly AUTH_PUBLIC_USERS_URL = "/auth/public-users";
  private readonly apiService = inject(ApiService);

  /**
   * Получает список программ с пагинацией и дополнительными фильтрами.
   *
   * @param skip смещение
   * @param take лимит
   * @param params дополнительные query-параметры
   */
  getAll(skip: number, take: number, params?: HttpParams): Observable<ApiPagination<Program>> {
    let httpParams = new HttpParams().set("limit", take).set("offset", skip);

    if (params) {
      params.keys().forEach(key => {
        const value = params.get(key);
        if (value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.apiService.get(`${this.PROGRAMS_URL}/`, httpParams);
  }

  getActualPrograms(): Observable<ApiPagination<Program>> {
    return this.apiService.get(`${this.PROGRAMS_URL}/`);
  }

  /**
   * Получает детальную информацию о программе.
   *
   * @param programId идентификатор программы
   */
  getOne(programId: number): Observable<Program> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/`);
  }

  /**
   * Создает новую программу.
   *
   * @param program данные программы
   */
  create(program: ProgramCreate): Observable<Program> {
    return this.apiService.post(`${this.PROGRAMS_URL}/`, program);
  }

  /**
   * Получает схему полей регистрации/анкеты программы.
   *
   * @param programId идентификатор программы
   */
  getDataSchema(programId: number): Observable<{ dataSchema: ProgramDataSchema }> {
    return this.apiService.get<{ dataSchema: ProgramDataSchema }>(
      `${this.PROGRAMS_URL}/${programId}/schema/`
    );
  }

  /**
   * Регистрирует пользователя в программе.
   *
   * @param programId идентификатор программы
   * @param additionalData заполненные дополнительные поля
   */
  register(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<ProgramDataSchema> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/register/`, additionalData);
  }

  /**
   * Получает проекты программы.
   *
   * @param programId идентификатор программы
   * @param params query-параметры пагинации/фильтрации
   */
  getAllProjects(programId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/projects`, params);
  }

  /**
   * Получает участников программы.
   *
   * @param programId идентификатор программы
   * @param skip смещение
   * @param take лимит
   */
  getAllMembers(programId: number, skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get(
      `${this.AUTH_PUBLIC_USERS_URL}/`,
      new HttpParams({ fromObject: { partner_program: programId, limit: take, offset: skip } })
    );
  }

  /**
   * Получает метаданные фильтров программы.
   *
   * @param programId идентификатор программы
   */
  getProgramFilters(programId: number): Observable<PartnerProgramFields[]> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/filters/`);
  }

  /**
   * Получает дополнительные поля для подачи проекта в программу.
   *
   * @param programId идентификатор программы
   */
  getProgramProjectAdditionalFields(programId: number): Observable<ProjectAdditionalFields> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/projects/apply/`);
  }

  /**
   * Отправляет заявку проекта в программу.
   *
   * @param programId идентификатор программы
   * @param body тело заявки
   */
  applyProjectToProgram(programId: number, body: any): Observable<any> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/projects/apply/`, body);
  }

  /**
   * Создает отфильтрованный список проектов программы по переданным фильтрам.
   *
   * @param programId идентификатор программы
   * @param filters объект фильтров
   * @param params query-параметры пагинации
   */
  createProgramFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<Project>> {
    let url = `${this.PROGRAMS_URL}/${programId}/projects/filter/`;
    if (params) {
      url += `?${params.toString()}`;
    }
    return this.apiService.post(url, { filters });
  }

  /**
   * Подтверждает подачу конкурсного проекта.
   *
   * @param relationId идентификатор связи project-program
   */
  submitCompettetiveProject(relationId: number): Observable<Project> {
    return this.apiService.post(
      `${this.PROGRAMS_URL}/partner-program-projects/${relationId}/submit/`,
      {}
    );
  }
}
