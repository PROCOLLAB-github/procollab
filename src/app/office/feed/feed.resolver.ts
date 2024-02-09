/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { FeedService } from "@office/feed/services/feed.service";

export const FeedResolver: ResolveFn<FeedItem[]> = () => {
  const feedService = inject(FeedService);

  return feedService.getFeed();
};
