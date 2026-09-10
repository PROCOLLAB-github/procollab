/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectProgramHttpAdapter } from "../../adapters/project/project-program-http.adapter";
import { map, Observable } from "rxjs";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { plainToInstance } from "class-transformer";
import { ProgramLinkField, ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";

/** Репозиторий связи проект↔программа: подача проекта и доп. поля программы. */
@Injectable({ providedIn: "root" })
export class ProjectProgramRepository implements ProjectProgramRepositoryPort {
  private readonly projectProgramAdapter = inject(ProjectProgramHttpAdapter);

  assignProjectToProgram(projectId: number, partnerProgramId: number): Observable<ProjectAssign> {
    return this.projectProgramAdapter
      .assignProjectToProgram(projectId, partnerProgramId)
      .pipe(map(assign => plainToInstance(ProjectAssign, assign)));
  }

  getProgramLinkFields(programLinkId: number): Observable<ProgramLinkFields> {
    return this.projectProgramAdapter.getProgramLinkFields(programLinkId).pipe(
      map(snapshot =>
        Object.assign(new ProgramLinkFields(), {
          ...snapshot,
          fields: snapshot.fields.map(field =>
            Object.assign(new ProgramLinkField(), field, { helpText: field.helpText ?? "" }),
          ),
        }),
      ),
    );
  }

  updateProgramLinkFields(
    programLinkId: number,
    newValues: ProjectNewAdditionalProgramFields[],
  ): Observable<void> {
    return this.projectProgramAdapter.updateProgramLinkFields(programLinkId, newValues);
  }
}
