/** @format */

import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ClosedVacancyComponent } from "@office/feed/shared/closed-vacancy/closed-vacancy.component";
import { ActivatedRoute } from "@angular/router";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { map, Subscription } from "rxjs";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ProjectNews } from "@office/projects/models/project-news.model";

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
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  ngOnInit() {
    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe((feed: FeedItem[]) => {
      this.feedItems.set(feed);
    });
    this.subscriptions$().push(routeData$);
  }

  ngOnDestroy() {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  feedItems: FeedItem[] = [];
  subscriptions$: Subscription[] = [];
}
