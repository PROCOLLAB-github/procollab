/** @format */

import { Provider } from "@angular/core";
import { ProjectRatingRepositoryPort } from "../../../domain/project/ports/project-rating.repository.port";
import { ProjectRatingRepository } from "../../repository/project/project-rating.repository";

export const PROJECT_RATING_PROVIDERS: Provider[] = [
  { provide: ProjectRatingRepositoryPort, useExisting: ProjectRatingRepository },
];
