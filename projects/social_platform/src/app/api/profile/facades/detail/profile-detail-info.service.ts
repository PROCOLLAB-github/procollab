/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import { concatMap, filter, map, Subject, takeUntil, tap } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { ActivatedRoute } from "@angular/router";
import { ExpandService } from "../../../expand/expand.service";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { ProfileDetailUIInfoService } from "./ui/profile-detail-ui-info.service";
import { NewsInfoService } from "../../../news/news-info.service";
import { AddProfileNewsUseCase } from "../../use-cases/add-profile-news.use-case";
import { DeleteProfileNewsUseCase } from "../../use-cases/delete-profile-news.use-case";
import { EditProfileNewsUseCase } from "../../use-cases/edit-profile-news.use-case";
import { FetchProfileNewsUseCase } from "../../use-cases/fetch-profile-news.use-case";
import { ReadProfileNewsUseCase } from "../../use-cases/read-profile-news.use-case";
import { ToggleProfileNewsLikeUseCase } from "../../use-cases/toggle-profile-news-like.use-case";
import { ProfileInfoService } from "../profile-info.service";

/** Фасад профиля (детали): новости профиля — CRUD, лайк, отметка прочтения по видимости. */
@Injectable()
export class ProfileDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly expandService = inject(ExpandService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly newsInfoService = inject(NewsInfoService);

  private readonly addProfileNewsUseCase = inject(AddProfileNewsUseCase);
  private readonly deleteProfileNewsUseCase = inject(DeleteProfileNewsUseCase);
  private readonly editProfileNewsUseCase = inject(EditProfileNewsUseCase);
  private readonly fetchProfileNewsUseCase = inject(FetchProfileNewsUseCase);
  private readonly readProfileNewsUseCase = inject(ReadProfileNewsUseCase);
  private readonly toggleProfileNewsLikeUseCase = inject(ToggleProfileNewsLikeUseCase);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly profile = this.profileInfoService.profile;
  private readonly news = this.newsInfoService.news;

  destroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationProfile(): void {
    this.route.data
      .pipe(
        map(data => {
          const user = data["data"]["user"];
          return {
            ...data,
            data: {
              ...data["data"],
              user: {
                ...user,
                progress: calculateProfileProgress(user),
              },
            },
          };
        }),
        filter(data => !!data["data"]["user"]),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: data => {
          this.profileDetailUIInfoService.applyInitProfile(data);
        },
      });

    this.initializationProfileVields();
    this.initializationProfileNews();
  }

  initCheckDescription(descEl?: ElementRef): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", !!this.profile()?.personal.aboutMe, descEl);
    }, 150);
  }

  onAddNews(news: { text: string; files: string[] }) {
    return this.addProfileNewsUseCase.execute(this.route.snapshot.params["id"], news).pipe(
      tap(result => {
        if (!result.ok) return;

        this.newsInfoService.applyAddNews(result.value);
      }),
      takeUntil(this.destroy$)
    );
  }

  onDeleteNews(newsId: number): void {
    this.newsInfoService.applyDeleteNews(newsId);

    this.deleteProfileNewsUseCase
      .execute(this.route.snapshot.params["id"], newsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => {} });
  }

  onLike(newsId: number) {
    const item = this.news().find(n => n.id === newsId);
    if (!item) return;

    this.toggleProfileNewsLikeUseCase
      .execute(this.route.snapshot.params["id"], newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.newsInfoService.applyLikeNews(newsId);
      });
  }

  onEditNews(news: ProfileNews, newsItemId: number) {
    return this.editProfileNewsUseCase
      .execute(this.route.snapshot.params["id"], newsItemId, news)
      .pipe(
        tap(result => {
          if (!result.ok) return;

          this.newsInfoService.applyEditNews(result.value);
        })
      );
  }

  onNewsInView(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      return Number((e.target as HTMLElement).dataset["id"]);
    });

    this.readProfileNewsUseCase
      .execute(Number(this.route.snapshot.params["id"]), ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private initializationProfileVields(): void {
    this.profileDetailUIInfoService.applySetLoggedUserId("logged", this.profile()!.id);
    this.profileDetailUIInfoService.applyProfileEmpty();
  }

  private initializationProfileNews(descEl?: ElementRef): void {
    this.route.params
      .pipe(
        map(r => r["id"]),
        concatMap(userId => this.fetchProfileNewsUseCase.execute(Number(userId))),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result.ok) return;

        this.newsInfoService.applySetNews(result.value);

        setTimeout(() => {
          this.setupNewsObserver();
        }, 100);
      });

    this.initCheckDescription(descEl);
  }

  private setupNewsObserver(): void {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(this.onNewsInView.bind(this), {
      root: document.querySelector(".office__body"),
      threshold: 0,
    });

    document.querySelectorAll(".news__item").forEach(el => {
      this.observer!.observe(el);
    });
  }
}
