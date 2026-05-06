/** @format */

import { Provider } from "@angular/core";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { ProgramNewsRepository } from "../../repository/program/program-news.repository";

export const PROGRAM_NEWS_PROVIDERS: Provider[] = [
  { provide: ProgramNewsRepositoryPort, useExisting: ProgramNewsRepository },
];
