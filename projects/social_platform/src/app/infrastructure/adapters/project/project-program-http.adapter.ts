/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { ProjectDto } from "./dto/project.dto";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";

/** HTTP-адаптер связи проект↔программа: подача проекта и доп. поля программы. */
@Injectable({ providedIn: "root" })
export class ProjectProgramHttpAdapter {
  private readonly apiService = inject(ApiService);
  private readonly PROJECTS_URL = "/projects";

  assignProjectToProgram(projectId: number, partnerProgramId: number): Observable<ProjectAssign> {
    return this.apiService.post(`${this.PROJECTS_URL}/assign-to-program/`, {
      projectId,
      partnerProgramId,
    });
  }

  sendNewProjectFieldsValues(
    projectId: number,
    newValues: ProjectNewAdditionalProgramFields[],
  ): Observable<ProjectDto> {
    const payload = newValues.map(({ fieldId, valueText }) => ({
      field_id: fieldId,
      value_text: valueText,
    }));
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/program-fields/`, payload);
  }
}
