/** @format */

import { Provider } from "@angular/core";
import { ProgramRepository } from "../../repository/program/program.repository";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";

export const PROGRAM_PROVIDERS: Provider[] = [
  { provide: ProgramRepositoryPort, useExisting: ProgramRepository },
];
