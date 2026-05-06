/** @format */

import { Provider } from "@angular/core";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { SpecializationsRepository } from "../repository/specializations/specializations.repository";

export const SPECIALIZATIONS_PROVIDERS: Provider[] = [
  { provide: SpecializationsRepositoryPort, useExisting: SpecializationsRepository },
];
