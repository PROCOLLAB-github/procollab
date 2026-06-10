/** @format */

import { Provider } from "@angular/core";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { IndustryRepository } from "../repository/industry/industry.repository";

export const INDUSTRY_PROVIDERS: Provider[] = [
  { provide: IndustryRepositoryPort, useExisting: IndustryRepository },
];
