/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { FeedItem, FeedItemType } from "@office/feed/models/feed-item.model";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class FeedService {
  constructor(private readonly apiService: ApiService) {}

  getFeed(
    offset: number,
    limit: number,
    type: FeedItemType[] | FeedItemType
  ): Observable<ApiPagination<FeedItem>> {
    return this.apiService.get(
      "/feed/",
      new HttpParams({
        fromObject: {
          limit,
          offset,
          type: Array.isArray(type)
            ? type.length === 0
              ? ["vacancy", "news", "project"].join("|")
              : type.join("|")
            : type,
        },
      })
    );
  }
}
