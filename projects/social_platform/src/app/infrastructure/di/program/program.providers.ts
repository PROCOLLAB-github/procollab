/** @format */

import { Provider } from "@angular/core";
import { ProgramRepository } from "../../repository/program/program.repository";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "../../repository/solution/solution.repository";

export const PROGRAM_PROVIDERS: Provider[] = [
  { provide: ProgramRepositoryPort, useExisting: ProgramRepository },
  { provide: SolutionRepositoryPort, useExisting: SolutionRepository },
];
