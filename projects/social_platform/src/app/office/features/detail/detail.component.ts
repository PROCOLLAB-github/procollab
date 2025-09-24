/** @format */

import { CommonModule, Location } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ButtonComponent, InputComponent } from "@ui/components";
import { BackComponent, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "@auth/services";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { concatMap, filter, map, Subscription, take, tap } from "rxjs";
import { User } from "@auth/models/user.model";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectService } from "@office/services/project.service";
import { Project } from "@office/models/project.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ProjectAssign } from "@office/projects/models/project-assign.model";
import { ProjectAdditionalService } from "@office/projects/edit/services/project-additional.service";
import { ProjectDataService } from "@office/projects/detail/services/project-data.service";
import { ProgramDataService } from "@office/program/services/program-data.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    ButtonComponent,
    BackComponent,
    ModalComponent,
    AvatarComponent,
    TooltipComponent,
    InputComponent,
  ],
  standalone: true,
})
export class DeatilComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly programDataService = inject(ProgramDataService);
  private readonly projectDataService = inject(ProjectDataService);
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Основные данные(типы данных, данные)
  info?: any;
  profile?: User;
  listType: "project" | "program" | "profile" = "project";

  // Переменная для подсказок
  isTooltipVisible = false;

  // Переменные для отображения данных в зависимости от url
  isProjectsPage = false;
  isMembersPage = false;
  isProjectsRatingPage = false;
  isTeamPage = false;
  isVacanciesPage = false;

  // Сторонние переменные для работы с роутингом или доп проверок
  backPath?: string;
  registerDateExpired?: boolean;
  isInProject?: boolean;

  // Переменные для работы с модалкой подачи проекта
  selectedProjectId = 0;
  dubplicatedProjectId = 0;
  memberProjects: Project[] = [];

  // Сигналы для работы с модальными окнами с текстом
  assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);

  // Переменные для работы с модалками
  isAssignProjectToProgramModalOpen = signal(false);
  showSubmitProjectModal = signal(false);
  isLeaveProjectModalOpen = false; // Флаг модального окна выхода
  isEditDisable = false; // Флаг недоступности редактирования
  isEditDisableModal = false; // Флаг недоступности редактирования для модалки
  openSupport = false; // Флаг модального окна поддержки
  leaderLeaveModal = false; // Флаг модального окна предупреждения лидера

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const listTypeSub$ = this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    this.initializeBackPath();

    this.updatePageStates();
    this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });

    const profileInfoSub$ = this.authService.profile.subscribe({
      next: profile => {
        this.isInProject = this.info?.collaborators
          .map((person: Collaborator) => person.userId)
          .includes(profile.id);
        this.profile = profile;
      },
    });

    this.initializeInfo();

    profileInfoSub$ && this.subscriptions.push(profileInfoSub$);
    listTypeSub$ && this.subscriptions.push(listTypeSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  // Геттеры для работы с отображением данных разного типа доступа
  get isUserManager() {
    if (this.listType === "program") {
      return this.info.isUserManager;
    }
  }

  get isUserMember() {
    if (this.listType === "program") {
      return this.info.isUserMember;
    }
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  /**
   * Переключатель для модалки выбора проекта
   */
  toggleSubmitProjectModal(): void {
    this.showSubmitProjectModal.set(!this.showSubmitProjectModal());

    if (!this.showSubmitProjectModal()) {
      this.selectedProjectId = 0;
    }
  }

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  /**
   * Обработчик изменения радио-кнопки для выбора проекта
   */
  onProjectRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedProjectId = +target.value;

    if (this.selectedProjectId) {
      this.memberProjects.find(project => project.id === this.selectedProjectId);
    }
  }

  /**
   * Добавление проекта на программу
   */
  addProjectModal(): void {
    if (!this.selectedProjectId) {
      return;
    }

    const selectedProject = this.memberProjects.find(
      project => project.id === this.selectedProjectId
    );

    this.assignProjectToProgram(selectedProject!);
  }

  /** Эмитим логику для привязки проекта к программе */
  /**
   * Привязка проекта к программе выбранной
   * Перенаправление её на редактирование "нового" проекта
   */
  assignProjectToProgram(project: Project): void {
    if (this.info.id) {
      this.projectService
        .assignProjectToProgram(project.id, Number(this.route.snapshot.params["programId"]))
        .subscribe({
          next: r => {
            this.dubplicatedProjectId = r.newProjectId;
            this.assignProjectToProgramModalMessage.set(r);
            this.isAssignProjectToProgramModalOpen.set(true);
            this.toggleSubmitProjectModal();
            this.selectedProjectId = 0;
          },

          error: err => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 400) {
                this.setAssignProjectToProgramError(err.error);
              }
            }
          },
        });
    }
  }

  closeAssignProjectToProgramModal(): void {
    this.isAssignProjectToProgramModalOpen.set(false);
    this.router.navigateByUrl(
      `/office/projects/${this.dubplicatedProjectId}/edit?editingStep=main`
    );
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
   * Обновляет состояния страниц на основе URL
   */
  private updatePageStates(url?: string): void {
    const currentUrl = url || this.router.url;

    this.isProjectsPage =
      currentUrl.includes("/projects") && !currentUrl.includes("/projects-rating");
    this.isMembersPage = currentUrl.includes("/members");
    this.isProjectsRatingPage = currentUrl.includes("/projects-rating");
  }

  private initializeInfo() {
    if (this.listType === "project") {
      // Подписка на данные проекта из резолвера
      const projectSub$ = this.projectDataService.project$
        .pipe(filter(project => !!project))
        .subscribe(project => {
          this.info = project;

          if (project?.partnerProgram) {
            this.isEditDisable = project.partnerProgram?.isSubmitted;
          }
        });

      projectSub$ && this.subscriptions.push(projectSub$);
    } else if (this.listType === "program") {
      const program$ = this.programDataService.program$
        .pipe(
          filter(program => !!program),

          tap(program => {
            if (program) {
              this.info = program;
              this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
            }
          })
        )
        .subscribe();

      const memeberProjects$ = this.projectService.getMy().subscribe({
        next: projects => {
          this.memberProjects = projects.results.filter(project => !project.draft);
        },
      });

      this.subscriptions.push(program$);
      this.subscriptions.push(memeberProjects$);
    }
  }

  /**
   * Инициализация строки для back компонента в зависимости от типа данных
   */
  private initializeBackPath(): void {
    if (this.listType === "project") {
      this.backPath = "/office/projects/all";
    } else if (this.listType === "program") {
      this.backPath = "/office/program/all";
    } else {
      this.backPath = "/office/members/all";
    }
  }
}
