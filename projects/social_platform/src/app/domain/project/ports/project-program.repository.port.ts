/** @format */

import { Observable } from "rxjs";
import { ProjectAssign } from "../project-assign.model";
import { ProgramLinkFields } from "../program-link-fields.model";
import { ProjectNewAdditionalProgramFields } from "../../program/partner-program-fields.model";

/** Порт связи проект↔программа: подача проекта и отправка доп. полей программы. */
export abstract class ProjectProgramRepositoryPort {
  abstract assignProjectToProgram(
    projectId: number,
    partnerProgramId: number,
  ): Observable<ProjectAssign>;

  abstract getProgramLinkFields(programLinkId: number): Observable<ProgramLinkFields>;

  abstract updateProgramLinkFields(
    programLinkId: number,
    newValues: ProjectNewAdditionalProgramFields[],
  ): Observable<void>;
}
