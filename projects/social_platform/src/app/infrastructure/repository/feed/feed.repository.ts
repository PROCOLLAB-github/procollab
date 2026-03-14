/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { FeedItem } from "../../../domain/feed/feed-item.model";
import { FeedRepositoryPort } from "../../../domain/feed/ports/feed.repository.port";
import { FeedHttpAdapter } from "../../adapters/feed/feed-http.adapter";

@Injectable({ providedIn: "root" })
export class FeedRepository implements FeedRepositoryPort {
  private readonly feedAdapter = inject(FeedHttpAdapter);

  fetchFeed(offset: number, limit: number, type: string): Observable<ApiPagination<FeedItem>> {
    return this.feedAdapter.fetchFeed(offset, limit, type);
  }
}
