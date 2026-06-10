/** @format */

import { Provider } from "@angular/core";
import { ProjectNewsRepository } from "../../repository/project/project-news.repository";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

export const PROJECT_NEWS_PROVIDERS: Provider[] = [
  { provide: PROJECT_NEWS_REPOSITORY, useExisting: ProjectNewsRepository },
];
