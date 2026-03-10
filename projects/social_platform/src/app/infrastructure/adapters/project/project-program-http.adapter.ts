/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ProjectAssign } from "../../../domain/project/project-assign.model";
import { ProjectDto } from "./dto/project.dto";
import { ProjectNewAdditionalProgramFields } from "../../../domain/program/partner-program-fields.model";

@Injectable({ providedIn: "root" })
export class ProjectProgramHttpAdapter {
  private readonly apiService = inject(ApiService);
  private readonly PROJECTS_URL = "/projects";

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
      projectId,
      partnerProgramId,
    });
  }

  /**
   * Ссоздаёт привязывает проект к программе с указанным ID.
   * После чего в БД появляется новый проект в черновиках
   *
   * @param projectId - id проекта
   * @param newValues - массив новых полей с значениями
   * @returns Observable<Project> - измененный проект
   */
  sendNewProjectFieldsValues(
    projectId: number,
    newValues: ProjectNewAdditionalProgramFields[]
  ): Observable<ProjectDto> {
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/program-fields/`, newValues);
  }
}
