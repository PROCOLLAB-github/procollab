/** @format */

import { Provider } from "@angular/core";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProjectProgramRepository } from "../../repository/project/project-program.repository";

export const PROJECT_PROGRAM_PROVIDERS: Provider[] = [
  { provide: ProjectProgramRepositoryPort, useExisting: ProjectProgramRepository },
];
