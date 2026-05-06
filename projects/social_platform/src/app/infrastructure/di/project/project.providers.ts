/** @format */

import { Provider } from "@angular/core";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ProjectRepository } from "../../repository/project/project.repository";

export const PROJECT_PROVIDERS: Provider[] = [
  { provide: ProjectRepositoryPort, useExisting: ProjectRepository },
];
