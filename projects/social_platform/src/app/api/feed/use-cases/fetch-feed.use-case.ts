/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { FeedRepositoryPort } from "@domain/feed/ports/feed.repository.port";
import { FeedItem } from "@domain/feed/feed-item.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class FetchFeedUseCase {
  private readonly feedRepositoryPort = inject(FeedRepositoryPort);

  execute(
    offset: number,
    limit: number,
    type: string
  ): Observable<Result<ApiPagination<FeedItem>, { kind: "fetch_feed_error"; cause?: unknown }>> {
    return this.feedRepositoryPort.fetchFeed(offset, limit, type).pipe(
      map(feed => ok<ApiPagination<FeedItem>>(feed)),
      catchError(error => of(fail({ kind: "fetch_feed_error" as const, cause: error })))
    );
  }
}
