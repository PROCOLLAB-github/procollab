/** @format */

import { Observable } from "rxjs";
import { FeedPage } from "../feed-item.model";

/** Порт репозитория ленты: страница `FeedItem` (offset/limit/type). */
export abstract class FeedRepositoryPort {
  abstract fetchFeed(offset: number, limit: number, type: string): Observable<FeedPage>;
}
