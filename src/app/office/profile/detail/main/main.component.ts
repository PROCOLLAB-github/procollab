/** @format */

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { expandElement } from "@utils/expand-element";
import { Observable, Subscription, map, noop } from "rxjs";
import { ProfileNewsService } from "../services/profile-news.service";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { ProfileNews } from "../models/profile-news.model";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ParseLinksPipe } from "@core/pipes/parse-links.pipe";
import { ParseBreaksPipe } from "@core/pipes/parse-breaks.pipe";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { IconComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from "@angular/common";

@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    TagComponent,
    NewsFormComponent,
    NewsCardComponent,
    IconComponent,
    RouterLink,
    NgTemplateOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    AsyncPipe,
  ],
})
export class ProfileMainComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly profileNewsService: ProfileNewsService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  subscriptions$: Subscription[] = [];

  user: Observable<User> = this.route.data.pipe(map(r => r["data"][0]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {
    const news$ = this.profileNewsService
      .fetchNews(this.route.snapshot.params["id"])
      .subscribe(news => {
        this.news = news.results;

        setTimeout(() => {
          const observer = new IntersectionObserver(this.onNewsInView.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });
          document.querySelectorAll(".news__item").forEach(e => {
            observer.observe(e);
          });
        });
      });
    this.subscriptions$.push(news$);
  }

  @ViewChild("descEl") descEl?: ElementRef;
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  descriptionExpandable = false;
  readFullDescription = false;

  readAllProjects = false;
  readAllAchievements = false;
  readAllLinks = false;

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  news: ProfileNews[] = [];

  onAddNews(news: { text: string; files: string[] }): void {
    this.profileNewsService.addNews(this.route.snapshot.params["id"], news).subscribe(newsRes => {
      this.newsFormComponent?.onResetForm();
      this.news.unshift(newsRes);
    });
  }

  onDeleteNews(newsId: number): void {
    const newsIdx = this.news.findIndex(n => n.id === newsId);
    this.news.splice(newsIdx, 1);

    this.profileNewsService.delete(this.route.snapshot.params["id"], newsId).subscribe(() => {});
  }

  onLike(newsId: number) {
    const item = this.news.find(n => n.id === newsId);
    if (!item) return;

    this.profileNewsService
      .toggleLike(this.route.snapshot.params["id"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  onEditNews(news: ProfileNews, newsItemId: number) {
    this.profileNewsService
      .editNews(this.route.snapshot.params["id"], newsItemId, news)
      .subscribe(resNews => {
        const newsIdx = this.news.findIndex(n => n.id === resNews.id);
        this.news[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  onNewsInView(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      return Number((e.target as HTMLElement).dataset["id"]);
    });

    this.profileNewsService.readNews(this.route.snapshot.params["id"], ids).subscribe(noop);
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
