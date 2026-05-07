/** @format */

import { inject, Injectable } from "@angular/core";
import { filter, map, Observable, Subject, takeUntil, tap } from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import { FeedNews } from "@domain/project/project-news.model";
import { ActivatedRoute } from "@angular/router";
import { Collaborator } from "@domain/project/collaborator.model";
import { ExpandService } from "../../../expand/expand.service";
import { ProjectsDetailUIInfoService } from "./ui/projects-detail-ui.service";
import { NewsInfoService } from "../../../news/news-info.service";
import { User } from "@domain/auth/user.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { RemoveProjectCollaboratorUseCase } from "../../use-cases/remove-project-collaborator.use-case";
import { TransferProjectOwnershipUseCase } from "../../use-cases/transfer-project-ownership.use-case";
import { FetchProjectNewsUseCase } from "../../use-cases/fetch-project-news.use-case";
import { ReadProjectNewsUseCase } from "../../use-cases/read-project-news.use-case";
import { AddProjectNewsUseCase } from "../../use-cases/add-project-news.use-case";
import { DeleteProjectNewsUseCase } from "../../use-cases/delete-project-news.use-case";
import { ToggleProjectNewsLikeUseCase } from "../../use-cases/toggle-project-news-like.use-case";
import { EditProjectNewsUseCase } from "../../use-cases/edit-project-news.use-case";

@Injectable({ providedIn: "root" })
export class ProjectsDetailService {
  private readonly removeProjectCollaboratorUseCase = inject(RemoveProjectCollaboratorUseCase);
  private readonly transferProjectOwnershipUseCase = inject(TransferProjectOwnershipUseCase);
  private readonly fetchProjectNewsUseCase = inject(FetchProjectNewsUseCase);
  private readonly readProjectNewsUseCase = inject(ReadProjectNewsUseCase);
  private readonly addProjectNewsUseCase = inject(AddProjectNewsUseCase);
  private readonly deleteProjectNewsUseCase = inject(DeleteProjectNewsUseCase);
  private readonly toggleProjectNewsLikeUseCase = inject(ToggleProjectNewsLikeUseCase);
  private readonly editProjectNewsUseCase = inject(EditProjectNewsUseCase);
  private readonly projectsDetailUIService = inject(ProjectsDetailUIInfoService);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute); // Сервис для работы с активным маршрутом
  private readonly expandService = inject(ExpandService);
  private readonly newsInfoService = inject(NewsInfoService);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly project = this.projectsDetailUIService.project;
  private readonly projectId = this.projectsDetailUIService.projectId;

  private readonly news = this.newsInfoService.news;

  readonly projSubscribers$?: Observable<User[]> = this.route.parent?.data.pipe(
    map(r => r["data"][1])
  );

  destroy(): void {
    this.observer?.disconnect();

    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationTeam(): void {
    this.authRepository.profile
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
    this.fetchProjectNewsUseCase
      .execute(String(this.project()?.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.newsInfoService.applySetNews(result.value);

        // Настройка наблюдателя для отслеживания просмотра новостей
        setTimeout(() => {
          this.observer?.disconnect();
          this.observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });

          document.querySelectorAll(".news__item").forEach(e => {
            this.observer?.observe(e);
          });
        });
      });
  }

  initializationProfile(): void {
    this.authRepository.profile.pipe(takeUntil(this.destroy$)).subscribe(profile => {
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

    this.removeProjectCollaboratorUseCase
      .execute(this.projectId()!, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            return;
          }

          this.projectsDetailUIService.removeCollaborators(result.value);
        },
      });
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const projectId = Number(this.project()?.id);
    if (!projectId) {
      return;
    }

    const ids = entries
      .map(e => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Number(e.target.dataset.id);
      })
      .filter(id => Number.isFinite(id));

    if (!ids.length) {
      return;
    }

    this.readProjectNewsUseCase.execute(projectId, ids).pipe(takeUntil(this.destroy$)).subscribe();
  }

  /**
   * Добавление новой новости
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }): Observable<void> {
    return this.addProjectNewsUseCase.execute(this.projectId()!.toString(), news).pipe(
      tap(result => {
        if (result.ok) {
          this.newsInfoService.applyAddNews(result.value);
        }
      }),
      filter(result => result.ok),
      map(() => undefined),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Удаление новости
   * @param newsId - ID удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    this.deleteProjectNewsUseCase
      .execute(this.projectId()!.toString(), newsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.newsInfoService.applyDeleteNews(result.value);
      });
  }

  /**
   * Переключение лайка новости
   * @param newsId - ID новости для лайка
   */
  onLike(newsId: number): void {
    const item = this.news().find(n => n.id === newsId);
    if (!item) return;

    this.toggleProjectNewsLikeUseCase
      .execute(this.projectId()!.toString(), newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.newsInfoService.applyLikeNews(result.value);
      });
  }

  /**
   * Редактирование новости
   * @param news - обновленные данные новости
   * @param newsItemId - ID редактируемой новости
   */
  onEditNews(news: FeedNews, newsItemId: number): Observable<void> {
    return this.editProjectNewsUseCase.execute(this.projectId()!.toString(), newsItemId, news).pipe(
      tap(result => {
        if (result.ok) {
          this.newsInfoService.applyEditNews(result.value);
        }
      }),
      filter(result => result.ok),
      map(() => undefined),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Удаление участника из проекта
   * @param id - ID удаляемого участника
   */
  onRemoveMember(id: Collaborator["userId"]) {
    this.removeProjectCollaboratorUseCase
      .execute(this.projectId()!, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.projectsDetailUIService.applyMembersManipulation(result.value);
      });
  }

  /**
   * Передача лидерства другому участнику
   * @param id - ID нового лидера
   */
  onTransferOwnership(id: Collaborator["userId"]) {
    this.transferProjectOwnershipUseCase
      .execute(this.projectId()!, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.projectsDetailUIService.applyMembersManipulation(result.value);
      });
  }
}
