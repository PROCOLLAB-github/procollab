/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { OpenVacancyComponent } from "../../shared/open-vacancy/open-vacancy.component";
import { IconComponent } from "@ui/components";
import { NewProjectComponent } from "@ui/shared/new-project/new-project.component";
import { FeedFilterComponent } from "@ui/components/feed-filter/feed-filter.component";
import { FeedInfoService } from "../../../api/feed/facades/feed-info.service";
import { FeedUIInfoService } from "../../../api/feed/facades/ui/feed-ui-info.service";

@Component({
  selector: "app-feed",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    NewProjectComponent,
    FeedFilterComponent,
    NewsCardComponent,
    OpenVacancyComponent,
    IconComponent,
  ],
  providers: [FeedInfoService, FeedUIInfoService],
  standalone: true,
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("feedRoot") feedRoot?: ElementRef<HTMLElement>;

  private readonly feedInfoService = inject(FeedInfoService);
  private readonly feedUIInfoService = inject(FeedUIInfoService);

  protected readonly feedItems = this.feedUIInfoService.feedItems;

  ngOnInit() {
    this.feedInfoService.initializationFeedNews(this.feedRoot!);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.feedRoot) {
      this.feedInfoService.initScroll(target, this.feedRoot!);
    }
  }

  ngOnDestroy() {
    this.feedInfoService.destroy();
  }

  onLike(newsId: number) {
    this.feedInfoService.onLike(newsId);
  }
}
