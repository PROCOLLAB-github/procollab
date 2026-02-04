/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import { concatMap, filter, map, Subject, takeUntil, tap } from "rxjs";
import { ProfileNews } from "../../../../domain/profile/profile-news.model";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../auth";
import { ProfileNewsService } from "../../profile-news.service";
import { ExpandService } from "../../../expand/expand.service";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { ProfileDetailUIInfoService } from "./ui/profile-detail-ui-info.service";
import { NewsInfoService } from "../../../news/news-info.service";
import { ProjectsDetailUIInfoService } from "../../../project/facades/detail/ui/projects-detail-ui.service";

@Injectable()
export class ProfileDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly profileNewsService = inject(ProfileNewsService);
  private readonly expandService = inject(ExpandService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly newsInfoService = inject(NewsInfoService);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly user = this.profileDetailUIInfoService.user;
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
      this.expandService.checkExpandable("description", !!this.user()?.aboutMe, descEl);
    }, 150);
  }

  /**
   * Добавление новой новости в профиль
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }) {
    return this.profileNewsService.addNews(this.route.snapshot.params["id"], news).pipe(
      tap(newsRes => {
        this.newsInfoService.applyAddNews(newsRes);
      }),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Удаление новости из профиля
   * @param newsId - идентификатор удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    this.newsInfoService.applyDeleteNews(newsId);

    this.profileNewsService
      .delete(this.route.snapshot.params["id"], newsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => {} });
  }

  /**
   * Переключение лайка новости
   * @param newsId - идентификатор новости для лайка/дизлайка
   */
  onLike(newsId: number) {
    const item = this.news().find(n => n.id === newsId);
    if (!item) return;

    this.profileNewsService
      .toggleLike(this.route.snapshot.params["id"], newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.newsInfoService.applyLikeNews(newsId);
      });
  }

  /**
   * Редактирование существующей новости
   * @param news - обновленные данные новости
   * @param newsItemId - идентификатор редактируемой новости
   */
  onEditNews(news: ProfileNews, newsItemId: number) {
    return this.profileNewsService
      .editNews(this.route.snapshot.params["id"], newsItemId, news)
      .pipe(
        tap(resNews => {
          this.newsInfoService.applyEditNews(resNews);
        })
      );
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные при скролле
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInView(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      return Number((e.target as HTMLElement).dataset["id"]);
    });

    this.profileNewsService
      .readNews(Number(this.route.snapshot.params["id"]), ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private initializationProfileVields(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe({
      next: user => {
        this.projectsDetailUIInfoService.applySetLoggedUserId("logged", user.id);
      },
    });

    this.profileDetailUIInfoService.applyProfileEmpty();
  }

  private initializationProfileNews(descEl?: ElementRef): void {
    this.route.params
      .pipe(
        map(r => r["id"]),
        concatMap(userId => this.profileNewsService.fetchNews(userId)),
        takeUntil(this.destroy$)
      )
      .subscribe(news => {
        this.newsInfoService.applySetNews(news);

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
