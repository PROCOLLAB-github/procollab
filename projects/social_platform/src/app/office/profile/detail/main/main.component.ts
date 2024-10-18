/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { expandElement } from "@utils/expand-element";
import { concatMap, map, noop, Observable, Subscription } from "rxjs";
import { ProfileNewsService } from "../services/profile-news.service";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { ProfileNews } from "../models/profile-news.model";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ParseBreaksPipe, ParseLinksPipe, PluralizePipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { IconComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { ProfileService } from "@auth/services/profile.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AvatarComponent } from "../../../../ui/components/avatar/avatar.component";

@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [
    TagComponent,
    NewsFormComponent,
    NewsCardComponent,
    IconComponent,
    ModalComponent,
    AvatarComponent,
    RouterLink,
    NgTemplateOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    AsyncPipe,
    PluralizePipe,
    AvatarComponent,
  ],
})
export class ProfileMainComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly profileNewsService: ProfileNewsService,
    private readonly profileApproveSkillService: ProfileService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  subscriptions$: Subscription[] = [];

  user: Observable<User> = this.route.data.pipe(map(r => r["data"][0]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {
    const route$ = this.route.params
      .pipe(
        map(r => r["id"]),
        concatMap(userId => this.profileNewsService.fetchNews(userId))
      )
      .subscribe(news => {
        this.news.set(news.results);

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
    this.subscriptions$.push(route$);
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
  readAllPrograms = false;
  readAllAchievements = false;
  readAllLinks = false;
  readAllEducation = false;
  readAllLanguages = false;
  readAllWorkExperience = false;
  readAllModal = false;

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  news = signal<ProfileNews[]>([]);

  onAddNews(news: { text: string; files: string[] }): void {
    this.profileNewsService.addNews(this.route.snapshot.params["id"], news).subscribe(newsRes => {
      this.newsFormComponent?.onResetForm();
      this.news.update(news => [newsRes, ...news]);
    });
  }

  onDeleteNews(newsId: number): void {
    const newsIdx = this.news().findIndex(n => n.id === newsId);
    this.news().splice(newsIdx, 1);

    this.profileNewsService.delete(this.route.snapshot.params["id"], newsId).subscribe(() => {});
  }

  onLike(newsId: number) {
    const item = this.news().find(n => n.id === newsId);
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
        const newsIdx = this.news().findIndex(n => n.id === resNews.id);
        this.news()[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  onNewsInView(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      return Number((e.target as HTMLElement).dataset["id"]);
    });

    this.profileNewsService.readNews(Number(this.route.snapshot.params["id"]), ids).subscribe(noop);
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onToggleApprove(skillId: number, event: Event, isApproved: boolean) {
    event.stopPropagation();
    const userId = this.route.snapshot.params["id"];

    if (isApproved) {
      this.profileApproveSkillService.unApproveSkill(userId, skillId).subscribe();
    } else {
      this.profileApproveSkillService.approveSkill(userId, skillId).subscribe();
    }
  }

  openSkills: any = {};

  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  onOpenChange(event: boolean, skillId: number) {
    if (this.openSkills[skillId] && !event) {
      this.openSkills[skillId] = false;
    } else {
      this.openSkills[skillId] = event;
    }
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }
}
