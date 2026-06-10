/** @format */

import { Provider } from "@angular/core";
import { ProfileNewsRepository } from "../repository/profile/profile-news.repository";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

export const PROFILE_NEWS_PROVIDERS: Provider[] = [
  { provide: PROFILE_NEWS_REPOSITORY, useExisting: ProfileNewsRepository },
];
