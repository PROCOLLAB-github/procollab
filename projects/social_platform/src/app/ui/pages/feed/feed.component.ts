/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { OpenVacancyComponent } from "./open-vacancy/open-vacancy.component";
import { IconComponent } from "@ui/primitives";
import { NewProjectComponent } from "./new-project/new-project.component";
import { FeedFilterComponent } from "@ui/widgets/feed-filter/feed-filter.component";
import { FeedInfoService } from "@api/feed/facades/feed-info.service";
import { FeedUIInfoService } from "@api/feed/facades/ui/feed-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { FeedItem } from "@domain/feed/feed-item.model";

/** Страница ленты активности. */
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
  ],
  providers: [FeedInfoService, FeedUIInfoService, ProjectTeamUIService],
})
export class FeedComponent implements AfterViewInit, OnDestroy {
  readonly feedRoot = viewChild<ElementRef<HTMLElement>>("feedRoot");

  private readonly feedInfoService = inject(FeedInfoService);
  private readonly feedUIInfoService = inject(FeedUIInfoService);

  protected readonly feedItems = this.feedUIInfoService.feedItems;
  protected readonly AppRoutes = AppRoutes;

  /** Ссылка-маршрут для карточки новости в зависимости от типа источника. */
  protected resourceLink(item: FeedItem): (string | number)[] {
    if (item.typeModel !== "news") return [];
    const source = item.content.contentObject;
    if ("email" in source) {
      return [AppRoutes.profile.detail(source.id)];
    }

    return [AppRoutes.projects.detail(source.id)];
  }

  protected isPersonNews(item: FeedItem): boolean {
    return item.typeModel === "news" && "email" in item.content.contentObject;
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body") as HTMLElement;
    const root = this.feedRoot();
    if (root) {
      this.feedInfoService.initializationFeedNews(root);
    }
    if (target && root) {
      this.feedInfoService.initScroll(target, root);
    }
  }

  ngOnDestroy() {
    this.feedInfoService.destroy();
  }

  onLike(newsId: number) {
    this.feedInfoService.onLike(newsId);
  }
}
