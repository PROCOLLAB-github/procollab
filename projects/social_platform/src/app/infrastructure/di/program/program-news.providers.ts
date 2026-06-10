/** @format */

import { Provider } from "@angular/core";
import { ProgramNewsRepository } from "../../repository/program/program-news.repository";
import { PROGRAM_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

export const PROGRAM_NEWS_PROVIDERS: Provider[] = [
  { provide: PROGRAM_NEWS_REPOSITORY, useExisting: ProgramNewsRepository },
];
