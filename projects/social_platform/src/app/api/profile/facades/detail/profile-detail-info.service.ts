/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import { concatMap, filter, map, Subject, takeUntil, tap } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { ActivatedRoute } from "@angular/router";
import { ExpandService } from "../../../expand/expand.service";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { ProfileDetailUIInfoService } from "./ui/profile-detail-ui-info.service";
import { NewsInfoService } from "../../../news/news-info.service";
import { ProjectsDetailUIInfoService } from "../../../project/facades/detail/ui/projects-detail-ui.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { AddProfileNewsUseCase } from "../../use-cases/add-profile-news.use-case";
import { DeleteProfileNewsUseCase } from "../../use-cases/delete-profile-news.use-case";
import { EditProfileNewsUseCase } from "../../use-cases/edit-profile-news.use-case";
import { FetchProfileNewsUseCase } from "../../use-cases/fetch-profile-news.use-case";
import { ReadProfileNewsUseCase } from "../../use-cases/read-profile-news.use-case";
import { ToggleProfileNewsLikeUseCase } from "../../use-cases/toggle-profile-news-like.use-case";

@Injectable()
export class ProfileDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly addProfileNewsUseCase = inject(AddProfileNewsUseCase);
  private readonly deleteProfileNewsUseCase = inject(DeleteProfileNewsUseCase);
  private readonly editProfileNewsUseCase = inject(EditProfileNewsUseCase);
  private readonly fetchProfileNewsUseCase = inject(FetchProfileNewsUseCase);
  private readonly readProfileNewsUseCase = inject(ReadProfileNewsUseCase);
  private readonly toggleProfileNewsLikeUseCase = inject(ToggleProfileNewsLikeUseCase);
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
    return this.addProfileNewsUseCase.execute(this.route.snapshot.params["id"], news).pipe(
      tap(result => {
        if (!result.ok) return;

        this.newsInfoService.applyAddNews(result.value);
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

    this.deleteProfileNewsUseCase
      .execute(this.route.snapshot.params["id"], newsId)
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

    this.toggleProfileNewsLikeUseCase
      .execute(this.route.snapshot.params["id"], newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.newsInfoService.applyLikeNews(newsId);
      });
  }

  /**
   * Редактирование существующей новости
   * @param news - обновленные данные новости
   * @param newsItemId - идентификатор редактируемой новости
   */
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

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные при скролле
   * @param entries - массив элементов, попавших в область видимости
   */
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
    this.authRepository.profile.pipe(takeUntil(this.destroy$)).subscribe({
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
