/** @format */

import { Provider } from "@angular/core";
import { VacancyRepositoryPort } from "../../domain/vacancy/ports/vacancy.repository.port";
import { VacancyRepository } from "../repository/vacancy/vacancy.repository";

export const VACANCY_PROVIDERS: Provider[] = [
  { provide: VacancyRepositoryPort, useExisting: VacancyRepository },
];
