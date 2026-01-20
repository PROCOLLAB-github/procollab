/** @format */

import { inject, Injectable } from "@angular/core";
import { filter, map, Observable, Subject, takeUntil, tap } from "rxjs";
import { ProjectService } from "../../project.service";
import { AuthService } from "../../../auth";
import { NavService } from "@ui/services/nav/nav.service";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";
import { ActivatedRoute } from "@angular/router";
import { ProjectNewsService } from "../../project-news.service";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { ExpandService } from "../../../expand/expand.service";
import { ProjectsDetailUIInfoService } from "./ui/projects-detail-ui.service";
import { NewsInfoService } from "../../../news/news-info.service";

@Injectable({ providedIn: "root" })
export class ProjectsDetailService {
  private readonly projectService = inject(ProjectService);
  private readonly projectsDetailUIService = inject(ProjectsDetailUIInfoService);
  private readonly authService = inject(AuthService);
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute); // Сервис для работы с активным маршрутом
  private readonly projectNewsService = inject(ProjectNewsService); // Сервис новостей проекта
  private readonly expandService = inject(ExpandService);
  private readonly newsInfoService = inject(NewsInfoService);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly project = this.projectsDetailUIService.project;
  private readonly projectId = this.projectsDetailUIService.projectId;

  private readonly news = this.newsInfoService.news;

  destroy(): void {
    this.observer?.disconnect();

    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationTeam(): void {
    this.authService.profile
      .pipe(
        filter(profile => !!profile),
        map(profile => profile.id),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: profileId => {
          if (profileId) {
            this.projectsDetailUIService.applySetLoggedUserId("logged", profileId);
          }
        },
      });
  }

  initializationProjectInfo(): void {
    this.navService.setNavTitle("Профиль проекта");

    this.projectsDetailUIService.applyDirectionItems();

    this.initCheckDescription();

    // Загрузка новостей проекта
    this.initializationNews();

    // Получение ID текущего пользователя
    this.initializationProfile();
  }

  initializationNews(): void {
    this.projectNewsService
      .fetchNews(String(this.project()?.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe(news => {
        this.newsInfoService.applySetNews(news);

        // Настройка наблюдателя для отслеживания просмотра новостей
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
  }

  initializationProfile(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.projectsDetailUIService.applySetLoggedUserId("profile", profile.id);
    });
  }

  initCheckDescription(): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", !!this.project()?.description);
    }, 150);
  }

  removeCollaboratorFromProject(userId: number): void {
    const projectId = this.projectId();
    if (!projectId) return;

    this.projectService
      .removeColloborator(this.projectId()!, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.projectsDetailUIService.removeCollaborators(userId);
        },
      });
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });

    this.projectNewsService
      .readNews(Number(this.project()?.id), ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  /**
   * Добавление новой новости
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }) {
    return this.projectNewsService.addNews(this.projectId()!.toString(), news).pipe(
      tap(newsRes => this.newsInfoService.applyAddNews(newsRes)),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Удаление новости
   * @param newsId - ID удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    this.newsInfoService.applyDeleteNews(newsId);

    this.projectNewsService
      .delete(this.projectId()!.toString(), newsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  /**
   * Переключение лайка новости
   * @param newsId - ID новости для лайка
   */
  onLike(newsId: number) {
    const item = this.news().find(n => n.id === newsId);
    if (!item) return;

    this.projectNewsService
      .toggleLike(this.projectId()!.toString(), newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.newsInfoService.applyLikeNews(newsId);
      });
  }

  /**
   * Редактирование новости
   * @param news - обновленные данные новости
   * @param newsItemId - ID редактируемой новости
   */
  onEditNews(news: FeedNews, newsItemId: number): Observable<any> {
    return this.projectNewsService.editNews(this.projectId()!.toString(), newsItemId, news).pipe(
      tap(resNews => this.newsInfoService.applyEditNews(resNews)),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Удаление участника из проекта
   * @param id - ID удаляемого участника
   */
  onRemoveMember(id: Collaborator["userId"]) {
    this.projectService
      .removeColloborator(this.projectId()!, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectsDetailUIService.applyMembersManipulation(id);
      });
  }

  /**
   * Передача лидерства другому участнику
   * @param id - ID нового лидера
   */
  onTransferOwnership(id: Collaborator["userId"]) {
    this.projectService
      .switchLeader(this.projectId()!, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectsDetailUIService.applyMembersManipulation(id);
      });
  }
}
