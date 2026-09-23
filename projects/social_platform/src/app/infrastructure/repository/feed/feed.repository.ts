/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FeedPage } from "@domain/feed/feed-item.model";
import { FeedRepositoryPort } from "@domain/feed/ports/feed.repository.port";
import { FeedHttpAdapter } from "../../adapters/feed/feed-http.adapter";

/** Репозиторий ленты: passthrough `fetchFeed` в адаптер. */
@Injectable({ providedIn: "root" })
export class FeedRepository implements FeedRepositoryPort {
  private readonly feedAdapter = inject(FeedHttpAdapter);

  fetchFeed(offset: number, limit: number, type: string): Observable<FeedPage> {
    return this.feedAdapter.fetchFeed(offset, limit, type);
  }
}
