/** @format */

import { Provider } from "@angular/core";
import { ProjectPartnerRepositoryPort } from "../../../domain/project/ports/project-partner.repository.port";
import { ProjectPartnerRepository } from "../../repository/project/project-partner.repository";

export const PROJECT_PARTNER_PROVIDERS: Provider[] = [
  { provide: ProjectPartnerRepositoryPort, useExisting: ProjectPartnerRepository },
];
