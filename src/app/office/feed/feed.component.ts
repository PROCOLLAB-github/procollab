/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ClosedVacancyComponent } from "@office/feed/shared/closed-vacancy/closed-vacancy.component";
import { ActivatedRoute } from "@angular/router";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { map, Subscription } from "rxjs";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { ApiPagination } from "@models/api-pagination.model";

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
export class FeedComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  // projectNewsService = inject(ProjectNewsService);

  ngOnInit() {
    const routeData$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((feed: ApiPagination<FeedItem>) => {
        this.feedItems.set(feed.results);
        this.totalItemsCount.set(feed.count);
      });
    this.subscriptions$().push(routeData$);
  }

  ngOnDestroy() {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  totalItemsCount = signal(0);
  feedItems = signal<FeedItem[]>([]);
  subscriptions$ = signal<Subscription[]>([]);

  onLike(newsId: number) {
    const item = this.feedItems()
      .filter(itm => itm.type === "news")
      .map(itm => itm.content)
      .find(n => n.id === newsId) as ProjectNews | undefined;
    if (!item) return;

    console.log(item);

    // this.projectNewsService
    //   .toggleLike(this.route.snapshot.params["projectId"], newsId, !item.isUserLiked)
    //   .subscribe(() => {
    //     item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
    //     item.isUserLiked = !item.isUserLiked;
    //   });
  }
}
