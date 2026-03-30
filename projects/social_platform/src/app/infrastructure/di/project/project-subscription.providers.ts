/** @format */

import { Provider } from "@angular/core";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriptionRepository } from "../../repository/project/project-subscription.repository";

export const PROJECT_SUBSCRIPTION_PROVIDERS: Provider[] = [
  { provide: ProjectSubscriptionRepositoryPort, useExisting: ProjectSubscriptionRepository },
];
