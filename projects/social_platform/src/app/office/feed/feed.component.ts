/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ActivatedRoute } from "@angular/router";
import { FeedItem, FeedItemType } from "@office/feed/models/feed-item.model";
import { concatMap, fromEvent, map, noop, of, skip, Subscription, tap, throttleTime } from "rxjs";
import { ApiPagination } from "@models/api-pagination.model";
import { FeedService } from "@office/feed/services/feed.service";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProfileNewsService } from "@office/profile/detail/services/profile-news.service";
import { FeedFilterComponent } from "@office/feed/filter/feed-filter.component";
import { NewsCardComponent } from "@office/features/news-card/news-card.component";
import { OpenVacancyComponent } from "./shared/open-vacancy/open-vacancy.component";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [
    CommonModule,
    NewProjectComponent,
    FeedFilterComponent,
    NewsCardComponent,
    OpenVacancyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  projectNewsService = inject(ProjectNewsService);
  profileNewsService = inject(ProfileNewsService);
  feedService = inject(FeedService);

  ngOnInit() {
    const routeData$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((feed: ApiPagination<FeedItem>) => {
        this.feedItems.set(feed.results);
        this.totalItemsCount.set(feed.count);
        this.feedPage.set(feed.results.length);

        setTimeout(() => {
          const observer = new IntersectionObserver(this.onFeedItemView.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });

          document.querySelectorAll(".page__item").forEach(e => {
            observer.observe(e);
          });
        });
      });
    this.subscriptions$().push(routeData$);

    const queryParams$ = this.route.queryParams
      .pipe(
        map(params => params["includes"]),
        tap(includes => {
          this.includes.set(includes);
        }),
        skip(1),
        concatMap(includes => {
          this.totalItemsCount.set(0);
          this.feedPage.set(0);

          return this.onFetch(0, this.perFetchTake(), includes ?? ["vacancy", "projects", "news"]);
        })
      )
      .subscribe(feed => {
        this.feedItems.set(feed);
        this.feedPage.set(feed.length);

        setTimeout(() => {
          this.feedRoot?.nativeElement.children[0].scrollIntoView({ behavior: "smooth" });
        });
      });
    this.subscriptions$().push(queryParams$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);

      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy() {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  @ViewChild("feedRoot") feedRoot?: ElementRef<HTMLElement>;

  totalItemsCount = signal(0);
  feedItems = signal<FeedItem[]>([]);
  feedPage = signal(0);
  perFetchTake = signal(20);
  includes = signal<FeedItemType[]>([]);

  subscriptions$ = signal<Subscription[]>([]);

  onLike(newsId: number) {
    const itemIdx = this.feedItems().findIndex(n => n.content.id === newsId);

    const item = this.feedItems()[itemIdx];
    if (!item || item.typeModel !== "news") return;

    if ("email" in item.content.contentObject) {
      this.profileNewsService
        .toggleLike(
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .subscribe(() => {
          item.content.likesCount = item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1;
          item.content.isUserLiked = !item.content.isUserLiked;

          this.feedItems.update(items => {
            const newItems = [...items];
            newItems.splice(itemIdx, 1, item);
            return newItems;
          });
        });
    } else if ("leader" in item.content.contentObject) {
      this.projectNewsService
        .toggleLike(
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .subscribe(() => {
          item.content.likesCount = item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1;
          item.content.isUserLiked = !item.content.isUserLiked;

          this.feedItems.update(items => {
            const newItems = [...items];
            newItems.splice(itemIdx, 1, item);
            return newItems;
          });
        });
    }
  }

  onFeedItemView(entries: IntersectionObserverEntry[]): void {
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
      this.projectNewsService
        .readNews(news.content.contentObject.id, [news.content.id])
        .subscribe(noop);
    });

    profileNews.forEach(news => {
      if (news.typeModel !== "news") return;
      this.profileNewsService
        .readNews(news.content.contentObject.id, [news.content.id])
        .subscribe(noop);
    });
  }

  onScroll() {
    if (this.totalItemsCount() && this.feedItems().length >= this.totalItemsCount()) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.feedRoot) return of({});

    const diff =
      target.scrollTop -
      this.feedRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      const currentOffset = this.feedItems().length;

      return this.onFetch(currentOffset, this.perFetchTake(), this.includes()).pipe(
        tap((feedChunk: FeedItem[]) => {
          const existingIds = new Set(this.feedItems().map(item => item.content.id));
          const uniqueNewItems = feedChunk.filter(item => !existingIds.has(item.content.id));

          if (uniqueNewItems.length > 0) {
            this.feedPage.update(page => page + uniqueNewItems.length);
            this.feedItems.update(items => [...items, ...uniqueNewItems]);
          }
        })
      );
    }

    return of({});
  }

  onFetch(
    offset: number,
    limit: number,
    includes: FeedItemType[] = ["project", "vacancy", "news"]
  ) {
    return this.feedService.getFeed(offset, limit, includes).pipe(
      tap(res => {
        this.totalItemsCount.set(res.count);
      }),
      map(res => res.results)
    );
  }
}
