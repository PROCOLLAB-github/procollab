/** @format */

import { Injectable, signal } from "@angular/core";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { FeedItem } from "projects/social_platform/src/app/domain/feed/feed-item.model";

@Injectable()
export class FeedUIInfoService {
  readonly feedItems = signal<FeedItem[]>([]);

  readonly totalItemsCount = signal(0);
  readonly feedPage = signal(0);
  readonly perFetchTake = signal(20);

  applyInitializationFeedNewsEvent(feed: ApiPagination<FeedItem>): void {
    this.feedItems.set(feed.results);
    this.totalItemsCount.set(feed.count);
    this.feedPage.set(feed.results.length);
  }

  applyFeedFilters(feed: FeedItem[]): void {
    this.feedItems.set(feed);
    this.feedPage.set(feed.length);
  }

  applyLikeNews(itemIdx: number): void {
    this.feedItems.update((items: any) => {
      const item = items[itemIdx];

      const updated = {
        ...item,
        content: {
          ...item.content,
          likesCount: item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1,
          isUserLiked: !item.content.isUserLiked,
        },
      };

      return items.map((it: any, i: number) => (i === itemIdx ? updated : it));
    });
  }
}
