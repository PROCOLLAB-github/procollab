/** @format */

import { Provider } from "@angular/core";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { ProjectResourceRepository } from "../../repository/project/project-resource.repository";

export const PROJECT_RESOURCES_PROVIDERS: Provider[] = [
  { provide: ProjectResourceRepositoryPort, useExisting: ProjectResourceRepository },
];
