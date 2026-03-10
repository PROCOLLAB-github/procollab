/** @format */

import { Provider } from "@angular/core";
import { ProjectNewsRepositoryPort } from "../../../domain/project/ports/project-news.repository.port";
import { ProjectNewsRepository } from "../../repository/project/project-news.repository";

export const PROJECT_NEWS_PROVIDERS: Provider[] = [
  { provide: ProjectNewsRepositoryPort, useExisting: ProjectNewsRepository },
];
