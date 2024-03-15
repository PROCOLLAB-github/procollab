/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { FeedItem, FeedItemType } from "@office/feed/models/feed-item.model";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class FeedService {
  constructor(private readonly apiService: ApiService) {}

  readonly FILTER_SPLIT_SYMBOL = "|";

  getFeed(
    offset: number,
    limit: number,
    type: FeedItemType[] | FeedItemType
  ): Observable<ApiPagination<FeedItem>> {
    let reqType: string;

    if (type.length === 0) {
      reqType = ["vacancy", "news", "project"].join(this.FILTER_SPLIT_SYMBOL);
    } else if (Array.isArray(type)) {
      reqType = type.join(this.FILTER_SPLIT_SYMBOL);
    } else {
      reqType = type;
    }

    return this.apiService.get(
      "/feed/",
      new HttpParams({
        fromObject: {
          limit,
          offset,
          type: reqType,
        },
      })
    );
  }
}
