/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { FeedPage } from "@domain/feed/feed-item.model";

/** HTTP-адаптер ленты: `/feed` (offset/limit/type). */
@Injectable({ providedIn: "root" })
export class FeedHttpAdapter {
  private readonly FEED_URL = "/feed";

  private readonly apiService = inject(ApiService);

  fetchFeed(offset: number, limit: number, type: string): Observable<FeedPage> {
    return this.apiService.get<FeedPage>(
      `${this.FEED_URL}/`,
      new HttpParams({ fromObject: { limit, offset, type } }),
    );
  }
}
