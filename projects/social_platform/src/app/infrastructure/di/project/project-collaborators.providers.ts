/** @format */

import { Provider } from "@angular/core";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { ProjectCollaboratorsRepository } from "../../repository/project/project-collaborators.repository";

export const PROJECT_COLLABORATORS_PROVIDERS: Provider[] = [
  { provide: ProjectCollaboratorsRepositoryPort, useExisting: ProjectCollaboratorsRepository },
];
