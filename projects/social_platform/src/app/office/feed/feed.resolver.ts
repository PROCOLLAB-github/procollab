/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { FeedService } from "@office/feed/services/feed.service";
import { ApiPagination } from "@models/api-pagination.model";

export const FeedResolver: ResolveFn<ApiPagination<FeedItem>> = route => {
  const feedService = inject(FeedService);

  return feedService.getFeed(
    0,
    20,
    route.queryParams["includes"] ?? ["vacancy", "news", "project"]
  );
};
