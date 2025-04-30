/** @format */

import { AsyncPipe, CommonModule, NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { Project } from "@models/project.model";
import { Vacancy } from "@models/vacancy.model";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { ProjectService } from "@office/services/project.service";
import { SubscriptionService } from "@office/services/subscription.service";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { IndustryService } from "@services/industry.service";
import { NavService } from "@services/nav.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { expandElement } from "@utils/expand-element";
import { containerSm } from "@utils/responsive";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import {
  Observable,
  Subscription,
  concatMap,
  forkJoin,
  map,
  noop,
  of,
  take,
  withLatestFrom,
} from "rxjs";
import { ProjectMemberCardComponent } from "../shared/project-member-card/project-member-card.component";
import { HttpResponse } from "@angular/common/http";

@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  standalone: true,
  imports: [
    AvatarComponent,
    RouterOutlet,
    RouterLink,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    NgTemplateOutlet,
    AsyncPipe,
    ProjectMemberCardComponent,
    RouterOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    NewsFormComponent,
    NewsCardComponent,
    CommonModule,
  ],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly industryService: IndustryService,
    public readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly projectNewsService: ProjectNewsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly projectService: ProjectService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  project$?: Observable<Project> = this.route.parent?.data.pipe(map(r => r["data"][0]));
  projSubscribers$?: Observable<User[]> = this.route.parent?.data.pipe(map(r => r["data"][1]));

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

    const profileId$ = this.authService.profile.subscribe(profile => {
      this.profileId = profile.id;
    });

    this.projSubscribers$
      ?.pipe(take(1), withLatestFrom(this.authService.profile))
      .subscribe(([projSubs, profile]) => {
        projSubs.some(sub => sub.id === profile.id)
          ? (this.isUserSubscribed = true)
          : (this.isUserSubscribed = false);
      });

    this.subscriptions$.push(news$, profileId$);
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

    this.projectNewsService
      .readNews(Number(this.route.snapshot.params["projectId"]), ids)
      .subscribe(noop);
  }

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  news: FeedNews[] = [];

  readFullDescription = false;

  descriptionExpandable!: boolean;

  readAllAchievements = false;
  readAllVacancies = false;
  readAllMembers = false;

  isCompleted = false;

  leaderLeaveModal = false;

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

  onEditNews(news: FeedNews, newsItemId: number) {
    this.projectNewsService
      .editNews(this.route.snapshot.params["projectId"], newsItemId, news)
      .subscribe(resNews => {
        const newsIdx = this.news.findIndex(n => n.id === resNews.id);
        this.news[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  onRemoveMember(id: Collaborator["userId"]) {
    this.project$
      ?.pipe(concatMap(project => this.projectService.removeColloborator(project.id, id)))
      .subscribe(() => {
        location.reload();
      });
  }

  onLeave() {
    this.project$?.pipe(concatMap(p => this.projectService.leave(p.id))).subscribe(
      () => {
        this.router
          .navigateByUrl("/office/projects/my")
          .then(() => console.debug("Route changed from ProjectInfoComponent"));
      },
      () => {
        this.leaderLeaveModal = true;
      }
    );
  }

  onTransferOwnership(id: Collaborator["userId"]) {
    this.project$
      ?.pipe(concatMap(project => this.projectService.switchLeader(project.id, id)))
      .subscribe(() => {
        location.reload();
      });
  }

  isUserSubscribed!: boolean;
  isUnsubscribeModalOpen = false;

  isLeaveProjectModalOpen = false;

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

  onCloseLeaderLeaveModal(): void {
    this.leaderLeaveModal = false;
  }

  onCloseLeaveProjectModal(): void {
    this.isLeaveProjectModalOpen = false;
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

  getSkillsNames(vacancy: Vacancy) {
    return vacancy.requiredSkills.map((s: any) => s.name).join(" • ");
  }
}
