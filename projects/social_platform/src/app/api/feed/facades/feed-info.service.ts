/** @format */

import { ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  concatMap,
  EMPTY,
  fromEvent,
  map,
  Observable,
  skip,
  Subject,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { FeedItem, FeedItemType } from "../../../domain/feed/feed-item.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { FeedUIInfoService } from "./ui/feed-ui-info.service";
import { FetchFeedUseCase } from "../use-cases/fetch-feed.use-case";
import { ReadFeedNewsUseCase } from "../use-cases/read-feed-news.use-case";
import { ToggleFeedLikeUseCase } from "../use-cases/toggle-feed-like.use-case";

const DEFAULT_FEED_TYPES: FeedItemType[] = ["vacancy", "project", "news"];
const FILTER_SPLIT_SYMBOL = "|";

@Injectable()
export class FeedInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly fetchFeedUseCase = inject(FetchFeedUseCase);
  private readonly readFeedNewsUseCase = inject(ReadFeedNewsUseCase);
  private readonly toggleFeedLikeUseCase = inject(ToggleFeedLikeUseCase);
  private readonly feedUIInfoService = inject(FeedUIInfoService);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  readonly feedItems = this.feedUIInfoService.feedItems;

  private readonly includes = signal<FeedItemType[]>([]);

  initializationFeedNews(feedRoot: ElementRef<HTMLElement>): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe((feed: ApiPagination<FeedItem>) => {
        this.feedUIInfoService.applyInitializationFeedNewsEvent(feed);

        this.observer?.disconnect();

        this.observer = new IntersectionObserver(this.onFeedItemView.bind(this), {
          root: document.querySelector(".office__body"),
          threshold: 0,
        });
      });

    this.route.queryParams
      .pipe(
        map(params => params["includes"]),
        tap(includes => {
          this.includes.set(includes);
        }),
        skip(1),
        concatMap(includes => {
          this.feedUIInfoService.totalItemsCount.set(0);
          this.feedUIInfoService.feedPage.set(0);

          return this.onFetch(
            0,
            this.feedUIInfoService.perFetchTake(),
            includes ?? DEFAULT_FEED_TYPES
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(feed => {
        this.feedUIInfoService.applyFeedFilters(feed);

        setTimeout(() => {
          feedRoot?.nativeElement.children[0].scrollIntoView({ behavior: "smooth" });
        });
      });
  }

  // onScroll Section
  // -------------------

  private onScroll(target: HTMLElement, feedRoot: ElementRef<HTMLElement>): Observable<FeedItem[]> {
    if (
      this.feedUIInfoService.totalItemsCount() &&
      this.feedItems().length >= this.feedUIInfoService.totalItemsCount()
    )
      return EMPTY;

    if (!target || !feedRoot) return EMPTY;

    const diff =
      target.scrollTop - feedRoot.nativeElement.getBoundingClientRect().height + window.innerHeight;

    if (diff > 0) {
      const currentOffset = this.feedItems().length;

      return this.onFetch(
        currentOffset,
        this.feedUIInfoService.perFetchTake(),
        this.includes()
      ).pipe(
        tap((feedChunk: FeedItem[]) => {
          const existingIds = new Set(this.feedItems().map(item => item.content.id));
          const uniqueNewItems = feedChunk.filter(item => !existingIds.has(item.content.id));

          if (uniqueNewItems.length > 0) {
            this.feedUIInfoService.feedPage.update(page => page + uniqueNewItems.length);
            this.feedItems.update(items => {
              const next = [...items, ...uniqueNewItems];
              queueMicrotask(() => this.observeFeedItems());
              return next;
            });
          }
        })
      );
    }

    return EMPTY;
  }

  // target for Scroll Section
  // -------------------

  initScroll(target: HTMLElement, feedRoot: ElementRef<HTMLElement>): void {
    if (target) {
      fromEvent(target, "scroll")
        .pipe(
          throttleTime(100),
          concatMap(() => this.onScroll(target, feedRoot)),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  private onFetch(offset: number, limit: number, includes: FeedItemType[] = DEFAULT_FEED_TYPES) {
    const type =
      includes.length === 0
        ? DEFAULT_FEED_TYPES.join(FILTER_SPLIT_SYMBOL)
        : includes.join(FILTER_SPLIT_SYMBOL);

    return this.fetchFeedUseCase.execute(offset, limit, type).pipe(
      tap(result => {
        this.feedUIInfoService.totalItemsCount.set(result.ok ? result.value.count : 0);
      }),
      map(result => (result.ok ? result.value.results : []))
    );
  }

  private onFeedItemView(entries: IntersectionObserverEntry[]): void {
    const items = entries
      .map(e => {
        return Number((e.target as HTMLElement).dataset["id"]);
      })
      .map(id => this.feedItems().find(item => item.content.id === id))
      .filter(Boolean) as FeedItem[];

    const projectNews = items.filter(
      item => item.typeModel === "news" && !("email" in item.content.contentObject)
    );
    const profileNews = items.filter(
      item => item.typeModel === "news" && "email" in item.content.contentObject
    );

    projectNews.forEach(news => {
      if (news.typeModel !== "news") return;
      this.readFeedNewsUseCase
        .execute("project", news.content.contentObject.id, [news.content.id])
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    });

    profileNews.forEach(news => {
      if (news.typeModel !== "news") return;
      this.readFeedNewsUseCase
        .execute("profile", news.content.contentObject.id, [news.content.id])
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    });
  }

  onLike(newsId: number) {
    const itemIdx = this.feedItems().findIndex(n => n.content.id === newsId);

    const item = this.feedItems()[itemIdx];
    if (!item || item.typeModel !== "news") return;

    if ("email" in item.content.contentObject) {
      this.toggleFeedLikeUseCase
        .execute(
          "profile",
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => {
          if (!result.ok) return;

          this.feedUIInfoService.applyLikeNews(itemIdx);
        });
    } else if ("leader" in item.content.contentObject) {
      this.toggleFeedLikeUseCase
        .execute(
          "project",
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => {
          if (!result.ok) return;

          this.feedUIInfoService.applyLikeNews(itemIdx);
        });
    }
  }

  private observeFeedItems(): void {
    if (!this.observer) return;

    document.querySelectorAll(".page__item").forEach(el => {
      this.observer!.observe(el);
    });
  }

  destroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
