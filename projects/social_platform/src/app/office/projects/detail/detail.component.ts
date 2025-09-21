/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { concatMap, filter, map, Subscription, take } from "rxjs";
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from "@angular/router";
import { Project } from "@models/project.model";
import { AuthService } from "@auth/services";
import { AsyncPipe, CommonModule, Location } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { BackComponent, IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { IndustryService } from "@office/services/industry.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProjectService } from "@office/services/project.service";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { ProjectDataService } from "./services/project-data.service";

/**
 * Компонент детального просмотра проекта
 *
 * Функциональность:
 * - Загружает данные проекта из резолвера
 * - Определяет, является ли текущий пользователь участником проекта
 * - Управляет подписками на Observable
 *
 * Принимает:
 * - Данные проекта через ActivatedRoute
 * - Профиль пользователя через AuthService
 *
 * Предоставляет:
 * - project - данные текущего проекта
 * - isInProject$ - Observable, показывающий участие пользователя в проекте
 */
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    AsyncPipe,
    IconComponent,
    UserLinksPipe,
    BackComponent,
    ButtonComponent,
    AvatarComponent,
    ModalComponent,
  ],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  public readonly authService = inject(AuthService);
  private readonly projectService = inject(ProjectService);
  public readonly industryService = inject(IndustryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly projectDataService = inject(ProjectDataService);

  /** Массив всех подписок компонента */
  subscriptions$: Subscription[] = [];

  /** Данные текущего проекта */
  project?: Project;

  // Состояние подписки и модальных окон
  isLeaveProjectModalOpen = false; // Флаг модального окна выхода
  isEditDisable = false; // Флаг недоступности редактирования
  isEditDisableModal = false; // Флаг недоступности редактирования для модалки
  openSupport = false; // Флаг модального окна поддержки
  leaderLeaveModal = false; // Флаг модального окна предупреждения лидера

  isTeamPage = false;
  isVacanciesPage = false;

  ngOnInit(): void {
    // Подписка на данные проекта из резолвера
    const projectSub$ = this.projectDataService.project$
      .pipe(
        filter(project => !!project),
        take(1)
      )
      .subscribe(project => {
        this.project = project;

        if (project?.partnerProgram) {
          this.isEditDisable = project.partnerProgram?.isSubmitted;
        }
      });

    this.updatePageStates();

    this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });

    projectSub$ && this.subscriptions$.push(projectSub$);
  }

  ngOnDestroy(): void {
    // Отписка от всех подписок для предотвращения утечек памяти
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Закрытие модального окна выхода из проекта
   */
  onCloseLeaveProjectModal(): void {
    this.isLeaveProjectModalOpen = false;
  }

  /**
   * Закрытие модального окна для невозможности редактировать проект
   */
  onUnableEditingProject(): void {
    if (this.isEditDisable) {
      this.isEditDisableModal = true;
    } else {
      this.isEditDisableModal = false;
    }
  }

  /**
   * Выход из проекта
   */
  onLeave() {
    this.route.data
      .pipe(map(r => r["data"][0]))
      .pipe(concatMap(p => this.projectService.leave(p.id)))
      .subscribe(
        () => {
          this.router
            .navigateByUrl("/office/projects/my")
            .then(() => console.debug("Route changed from ProjectInfoComponent"));
        },
        () => {
          this.leaderLeaveModal = true; // Показываем предупреждение для лидера
        }
      );
  }

  /**
   * Закрытие модального окна предупреждения лидера
   */
  onCloseLeaderLeaveModal(): void {
    this.leaderLeaveModal = false;
  }

  /** Observable, определяющий участие текущего пользователя в проекте */
  isInProject$ = this.authService.profile.pipe(
    map(profile => this.project?.collaborators.map(person => person.userId).includes(profile.id))
  );

  private updatePageStates(url?: string) {
    const currentUrl = url || this.router.url;

    this.isTeamPage = currentUrl.includes("/team");
    this.isVacanciesPage = currentUrl.includes("/vacancies");
  }
}
