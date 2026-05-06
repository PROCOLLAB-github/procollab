/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedItem } from "@domain/feed/feed-item.model";
import { AsyncState, initial, isLoading, isSuccess, success } from "@domain/shared/async-state";

@Injectable()
export class FeedUIInfoService {
  readonly feedItems$ = signal<AsyncState<FeedItem[]>>(initial());

  readonly feedItems = computed(() => {
    const state = this.feedItems$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  readonly totalItemsCount = signal(0);
  readonly feedPage = signal(0);
  readonly perFetchTake = signal(20);

  applyInitializationFeedNewsEvent(feed: ApiPagination<FeedItem>): void {
    this.feedItems$.set(success(feed.results));
    this.totalItemsCount.set(feed.count);
    this.feedPage.set(feed.results.length);
  }

  applyFeedFilters(feed: FeedItem[]): void {
    this.feedItems$.set(success(feed));
    this.feedPage.set(feed.length);
  }

  applyLikeNews(itemIdx: number): void {
    this.feedItems$.update(state => {
      if (!isSuccess(state)) return state;

      const items = state.data;
      const item = items[itemIdx];

      if (item.typeModel !== "news") return state;

      const updated: FeedItem = {
        ...item,
        content: {
          ...item.content,
          likesCount: item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1,
          isUserLiked: !item.content.isUserLiked,
        },
      };

      return success(items.map((it, i) => (i === itemIdx ? updated : it)));
    });
  }
}
