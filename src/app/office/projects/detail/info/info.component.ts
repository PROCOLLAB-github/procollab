/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  concatMap,
  forkJoin,
  map,
  merge,
  noop,
  Observable,
  of,
  Subscriber,
  Subscription,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from "rxjs";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { NavService } from "@services/nav.service";
import { Vacancy } from "@models/vacancy.model";
import { AuthService } from "@auth/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { containerSm } from "@utils/responsive";
import { UntypedFormBuilder, FormGroup, Validators } from "@angular/forms";
import { expandElement } from "@utils/expand-element";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { SubscriptionService } from "@office/services/subscription.service";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";

@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    public readonly industryService: IndustryService,
    public readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly projectNewsService: ProjectNewsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly fb: UntypedFormBuilder,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  project$?: Observable<Project> = this.route.parent?.data.pipe(map(r => r["data"][0]));

  profileId!: number;

  vacancies$: Observable<Vacancy[]> = this.route.data.pipe(map(r => r["data"]));
  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");

    const news$ = this.projectNewsService
      .fetchNews(this.route.snapshot.params["projectId"])
      .subscribe(news => {
        this.news = news.results;

        setTimeout(() => {
          const observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });
          document.querySelectorAll(".news__item").forEach(e => {
            observer.observe(e);
          });
        });
      });

    this.route.parent?.data
      .pipe(
        take(1),
        map(r => r["data"][1] as ProjectSubscriber[]),
        withLatestFrom(this.authService.profile)
      )
      .subscribe(([subs, profile]) => {
        subs.some(sub => sub.id === profile.id)
          ? (this.isUserSubscribed = true)
          : (this.isUserSubscribed = false);
      });

    this.subscriptions$.push(news$);

    this.authService.profile.pipe(take(1)).subscribe(profile => {
      this.profileId = profile.id;
    });
  }

  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;
  ngAfterViewInit(): void {
    if (containerSm < window.innerWidth) {
      this.contentEl?.nativeElement.append(this.newsEl?.nativeElement);
    }

    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });

    this.projectNewsService.readNews(this.route.snapshot.params["projectId"], ids).subscribe(noop);
  }

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  news: ProjectNews[] = [];

  readFullDescription = false;

  descriptionExpandable!: boolean;

  readAllAchievements = false;
  readAllVacancies = false;
  readAllMembers = false;

  onAddNews(news: { text: string; files: string[] }): void {
    this.projectNewsService
      .addNews(this.route.snapshot.params["projectId"], news)
      .subscribe(newsRes => {
        this.newsFormComponent?.onResetForm();
        this.news.unshift(newsRes);
      });
  }

  onDeleteNews(newsId: number): void {
    const newsIdx = this.news.findIndex(n => n.id === newsId);
    this.news.splice(newsIdx, 1);

    this.projectNewsService
      .delete(this.route.snapshot.params["projectId"], newsId)
      .subscribe(() => {});
  }

  onLike(newsId: number) {
    const item = this.news.find(n => n.id === newsId);
    if (!item) return;

    this.projectNewsService
      .toggleLike(this.route.snapshot.params["projectId"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  onEditNews(news: ProjectNews, newsItemId: number) {
    this.projectNewsService
      .editNews(this.route.snapshot.params["projectId"], newsItemId, news)
      .subscribe(resNews => {
        const newsIdx = this.news.findIndex(n => n.id === resNews.id);
        this.news[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  isUserSubscribed!: boolean;
  isUnsubscribeModalOpen = false;

  onSubscribe(projectId: number): void {
    if (this.isUserSubscribed) {
      this.isUnsubscribeModalOpen = true;
      return;
    }
    this.subscriptionService.addSubscription(projectId).subscribe(() => {
      this.isUserSubscribed = true;
    });
  }

  onUnsubscribe(projectId: number): void {
    this.subscriptionService.deleteSubscription(projectId).subscribe(() => {
      this.isUserSubscribed = false;
      this.isUnsubscribeModalOpen = false;
    });
  }

  onCloseUnsubscribeModal(): void {
    this.isUnsubscribeModalOpen = false;
  }

  openSupport = false;
  isInProject = this.project$?.pipe(
    concatMap(project => forkJoin([of(project), this.authService.profile.pipe(take(1))])),
    map(([project, profile]) => project.collaborators.map(c => c.userId).includes(profile.id))
  );

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
