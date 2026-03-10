/** @format */

import { Provider } from "@angular/core";
import { ProjectGoalsRepositoryPort } from "../../../domain/project/ports/project-goals.repository.port";
import { ProjectGoalsRepository } from "../../repository/project/project-goals.repository";

export const PROJECT_GOALS_PROVIDERS: Provider[] = [
  { provide: ProjectGoalsRepositoryPort, useExisting: ProjectGoalsRepository },
];
