/** @format */

import { Provider } from "@angular/core";
import { FeedRepositoryPort } from "@domain/feed/ports/feed.repository.port";
import { FeedRepository } from "../repository/feed/feed.repository";

export const FEED_PROVIDERS: Provider[] = [
  { provide: FeedRepositoryPort, useExisting: FeedRepository },
];
