/** @format */
import { Provider } from "@angular/core";
import { ProgramOrganizersRepositoryPort } from "@domain/program/ports/program-organizers.repository.port";
import { ProgramOrganizersRepository } from "../../repository/program/program-organizers.repository";
export const PROGRAM_ORGANIZERS_PROVIDERS: Provider[] = [
  { provide: ProgramOrganizersRepositoryPort, useExisting: ProgramOrganizersRepository },
];
