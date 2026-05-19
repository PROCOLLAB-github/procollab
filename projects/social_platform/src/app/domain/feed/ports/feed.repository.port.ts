/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { FeedItem } from "../feed-item.model";

/** Порт репозитория ленты: страница `FeedItem` (offset/limit/type). */
export abstract class FeedRepositoryPort {
  abstract fetchFeed(
    offset: number,
    limit: number,
    type: string
  ): Observable<ApiPagination<FeedItem>>;
}
