/** @format */

import { Provider } from "@angular/core";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProfileNewsRepository } from "../repository/profile/profile-news.repository";

export const PROFILE_NEWS_PROVIDERS: Provider[] = [
  { provide: ProfileNewsRepositoryPort, useExisting: ProfileNewsRepository },
];
