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
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ClosedVacancyComponent } from "@office/feed/shared/closed-vacancy/closed-vacancy.component";
import { ActivatedRoute } from "@angular/router";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ApiPagination } from "@models/api-pagination.model";
import { FeedService } from "@office/feed/services/feed.service";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProfileNewsService } from "@office/profile/detail/services/profile-news.service";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [
    CommonModule,
    OpenVacancyComponent,
    NewProjectComponent,
    ClosedVacancyComponent,
    NewsCardComponent,
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
      });
    this.subscriptions$().push(routeData$);
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
  feedPage = signal(1);
  perFetchTake = signal(20);
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

  onScroll() {
    if (this.totalItemsCount() && this.feedItems().length >= this.totalItemsCount()) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.feedRoot) return of({});

    const diff =
      target.scrollTop -
      this.feedRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      return this.onFetch(this.feedPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((feedChunk: FeedItem[]) => {
          this.feedPage.update(page => page + 1);
          this.feedItems.update(items => [...items, ...feedChunk]);
        })
      );
    }

    return of({});
  }

  onFetch(offset: number, limit: number) {
    return this.feedService.getFeed(offset, limit, ["project", "vacancy", "news"]).pipe(
      tap(res => {
        this.totalItemsCount.set(res.count);
      }),
      map(res => res.results)
    );
  }
}