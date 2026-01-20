/** @format */

import { CommonModule, Location } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ButtonComponent, InputComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { concatMap, EMPTY, filter, map, Observable, of, Subscription, tap } from "rxjs";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApproveSkillComponent } from "../approve-skill/approve-skill.component";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { AuthService } from "../../../api/auth";
import { ProjectService } from "../../../api/project/project.service";
import { ProgramDataService } from "@office/program/services/program-data.service";
import { ProjectDataService } from "../../../api/project/project-data.service";
import { ProjectAdditionalService } from "../../../api/project/project-additional.service";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { ProfileDataService } from "../../../api/profile/profile-date.service";
import { ProfileService } from "../../../api/auth/profile.service";
import { ChatService } from "../../../api/chat/chat.service";
import { ProgramService } from "../../../api/program/program.service";
import { InviteService } from "../../../api/invite/invite.service";
import { ProjectFormService } from "../../../api/project/project-form.service";
import { User } from "../../../domain/auth/user.model";
import { Project } from "../../../domain/project/project.model";
import {
  PartnerProgramFields,
  projectNewAdditionalProgramVields,
} from "../../../domain/program/partner-program-fields.model";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { saveFile } from "@utils/helpers/export-file";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { Collaborator } from "../../../domain/project/collaborator.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ModalComponent,
    AvatarComponent,
    TooltipComponent,
    ApproveSkillComponent,
    InputComponent,
    TruncatePipe,
    ControlErrorPipe,
  ],
  standalone: true,
})
export class DeatilComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly programDataService = inject(ProgramDataService);
  private readonly projectDataService = inject(ProjectDataService);
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  protected readonly location = inject(Location);
  private readonly profileDataService = inject(ProfileDataService);
  public readonly skillsProfileService = inject(ProfileService);
  public readonly chatService = inject(ChatService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly programService = inject(ProgramService);
  private readonly inviteService = inject(InviteService);
  private readonly validationService = inject(ValidationService);
  private readonly projectFormService = inject(ProjectFormService);

  info = signal<any | undefined>(undefined);
  profile?: User;
  profileProjects = signal<User["projects"]>([]);
  listType: "project" | "program" | "profile" = "project";

  // Переменная для подсказок
  isTooltipVisible = false;

  tooltipText = "Заполни до конца — и открой весь функционал платформы!";

  // Переменные для отображения данных в зависимости от url
  isProjectsPage = false;
  isMembersPage = false;
  isProjectsRatingPage = false;

  isTeamPage = false;
  isVacanciesPage = false;
  isProjectChatPage = false;
  isProjectWorkSectionPage = false;

  isKanbanBoardPage = false;
  isGantDiagramPage = false;

  // Сторонние переменные для работы с роутингом или доп проверок
  backPath?: string;
  registerDateExpired?: boolean;
  submissionProjectDateExpired?: boolean;
  isInProject?: boolean;

  isSended = false;
  isSubscriptionActive = signal(false);
  isProfileFill = false;

  // Переменные для работы с модалкой подачи проекта
  selectedProjectId: number | null = null;
  memberProjects: Project[] = [];

  userType = signal<number | undefined>(undefined);

  // Сигналы для работы с модальными окнами с текстом
  // assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);
  errorMessageModal = signal("");

  additionalFields = signal<PartnerProgramFields[]>([]);

  // Переменные для работы с модалками
  isAssignProjectToProgramModalOpen = signal(false);
  showSubmitProjectModal = signal(false);
  isProgramEndedModalOpen = signal(false);
  isProgramSubmissionProjectsEndedModalOpen = signal<boolean>(false);
  isLeaveProjectModalOpen = false; // Флаг модального окна выхода
  isEditDisable = false; // Флаг недоступности редактирования
  isEditDisableModal = false; // Флаг недоступности редактирования для модалки
  openSupport = false; // Флаг модального окна поддержки
  leaderLeaveModal = false; // Флаг модального окна предупреждения лидера
  isDelayModalOpen = false;

  // Переменные для работы с подтверждением навыков
  showApproveSkillModal = false;
  showSendInviteModal = false;
  showNoProjectsModal = false;
  showActiveInviteModal = false;
  showNoInProgramModal = false;
  showSuccessInviteModal = false;
  readAllModal = false;

  // Сигналы для работы с модальными окнами с текстом
  assignProjectToProgramModalMessage = signal<string | null>(null);

  subscriptions: Subscription[] = [];

  get projectForm() {
    return this.projectFormService.formModel;
  }

  readonly inviteForm = this.fb.group({
    role: ["", Validators.required],
  });

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    const listTypeSub$ = this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    this.initializeBackPath();

    this.updatePageStates();
    this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });

    this.initializeInfo();

    this.subscriptions.push(listTypeSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  // Геттеры для работы с отображением данных разного типа доступа
  get isUserManager() {
    if (this.listType === "program") {
      return this.info().isUserManager;
    }
  }

  get isUserMember() {
    if (this.listType === "program") {
      return this.info().isUserMember;
    }
  }

  get isUserExpert() {
    const type = this.userType();
    return type !== undefined && type === 3;
  }

  get isProjectAssigned() {
    const programId = this.info()?.id;

    return this.memberProjects.some(
      project => project.leader === this.profile?.id && project.partnerProgram?.id === programId
    );
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  /**
   * Переключатель для модалки выбора проекта
   */
  // toggleSubmitProjectModal(): void {
  //   this.showSubmitProjectModal.set(!this.showSubmitProjectModal());

  //   if (!this.showSubmitProjectModal()) {
  //     this.selectedProjectId = null;
  //   }
  // }

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
  // selectProject(): void {
  //   if (this.selectedProjectId === null) {
  //     return;
  //   }

  //   const selectedProject = this.memberProjects.find(
  //     project => project.id === this.selectedProjectId
  //   );

  //   console.log(selectedProject);
  // }

  // get isProjectSelected(): boolean {
  //   return this.selectedProjectId !== null;
  // }

  addNewProject(): void {
    const newFieldsFormValues: projectNewAdditionalProgramVields[] = [];

    this.additionalFields().forEach((field: PartnerProgramFields) => {
      newFieldsFormValues.push({
        field_id: field.id,
        value_text: field.options.length ? field.options[0] : "'",
      });
    });

    const body = { project: this.projectForm.value, program_field_values: newFieldsFormValues };

    this.programService.applyProjectToProgram(this.info().id, body).subscribe({
      next: r => {
        this.router
          .navigate([`/office/projects/${r.projectId}/edit`], {
            queryParams: { editingStep: "main", fromProgram: true },
          })
          .then(() => console.debug("Route change from ProjectsComponent"));
      },
      error: err => {
        if (err) {
          if (err.status === 400) {
            this.isAssignProjectToProgramModalOpen.set(true);
            this.assignProjectToProgramModalMessage.set(err.error.detail);
          }
        }
      },
    });
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
   * Копирование ссылки на профиль в буфер обмена
   */
  onCopyLink(profileId: number): void {
    let fullUrl = "";

    // Формирование URL в зависимости от типа ресурса
    fullUrl = `${location.origin}/office/profile/${profileId}/`;

    // Копирование в буфер обмена
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.snackbarService.success("скопирован URL");
    });
  }

  openSkills: any = {};

  /**
   * Открытие модального окна с информацией о подтверждениях навыка
   * @param skillId - идентификатор навыка
   */
  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }

  /**
   * Отправка CV пользователя на email
   * Проверяет ограничения по времени и отправляет CV на почту пользователя
   */
  downloadCV() {
    this.isSended = true;
    this.authService.downloadCV().subscribe({
      next: blob => {
        saveFile(blob, "cv", this.profile?.firstName + " " + this.profile?.lastName);
        this.isSended = false;
      },
      error: err => {
        this.isSended = false;
        if (err.status === 400) {
          this.isDelayModalOpen = true;
        }
      },
    });
  }

  /**
   * Открывает модалку для отправки приглашения пользователю
   * Проверяет какие отрендерить проекты где profile.id === leader
   */
  inviteUser(): void {
    if (!this.profileProjects().length) {
      this.showNoProjectsModal = true;
    } else {
      this.showSendInviteModal = true;
    }
  }

  sendInvite(): void {
    const role = this.inviteForm.get("role")?.value;
    const userId = this.route.snapshot.params["id"];

    if (
      !this.validationService.getFormValidation(this.inviteForm) ||
      this.selectedProjectId === null
    ) {
      return;
    }

    this.inviteService.sendForUser(userId, this.selectedProjectId, role!).subscribe({
      next: () => {
        this.showSendInviteModal = false;
        this.showSuccessInviteModal = true;

        this.inviteForm.reset();
        this.selectedProjectId = null;
      },
      error: err => {
        if (err.error.user[0].includes("проект относится к программе")) {
          this.showNoInProgramModal = true;
        } else if (err.error.user[0].includes("активное приглашение")) {
          this.showActiveInviteModal = true;
        }
      },
    });
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(): void {
    switch (this.listType) {
      case "profile":
        this.router.navigateByUrl(`/office/profile/${this.info().id}`);
        break;

      case "project":
        this.router.navigateByUrl(`/office/projects/${this.info().id}`);
        break;

      case "program":
        this.router.navigateByUrl(`/office/program/${this.info().id}`);
        break;
    }
  }

  routingToMyProjects(): void {
    this.router.navigateByUrl(`/office/projects/my`);
  }

  /**
   * Проверка завершения программы перед регистрацией
   */
  checkPrograRegistrationEnded(event: Event): void {
    const program = this.info();

    if (
      program?.datetimeRegistrationEnds &&
      Date.now() > Date.parse(program.datetimeRegistrationEnds)
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.isProgramEndedModalOpen.set(true);
    } else if (
      program?.datetimeProjectSubmissionEnds &&
      Date.now() > Date.parse(program?.datetimeProjectSubmissionEnds)
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.isProgramSubmissionProjectsEndedModalOpen.set(true);
    } else {
      this.router.navigateByUrl("/office/program/" + this.info().id + "/register");
    }
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

    this.isTeamPage = currentUrl.includes("/team");
    this.isVacanciesPage = currentUrl.includes("/vacancies");
    this.isProjectChatPage = currentUrl.includes("/chat");
    this.isProjectWorkSectionPage = currentUrl.includes("/work-section");

    this.isGantDiagramPage = currentUrl.includes("/gant-diagram");
    this.isKanbanBoardPage = currentUrl.includes("/kanban");
  }

  private initializeInfo() {
    if (this.listType === "project") {
      const project = this.projectDataService.project;
      this.info = project;

      this.isEditDisable = this.info()?.partnerProgram?.isSubmitted ?? false;

      this.isInProfileInfo();
    } else if (this.listType === "program") {
      const program$ = this.programDataService.program$
        .pipe(
          filter(program => !!program),
          tap(program => {
            if (program) {
              this.info.set(program);
              this.loadAdditionalFields(program.id);
              this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
              this.submissionProjectDateExpired =
                Date.now() > Date.parse(program.datetimeProjectSubmissionEnds);
            }
          })
        )
        .subscribe();

      const profileDataSub$ = this.authService.profile.pipe(filter(user => !!user)).subscribe({
        next: user => {
          this.userType.set(user!.userType);
          this.profile = user;
          this.cdRef.detectChanges();
        },
      });

      const memeberProjects$ = this.projectService.getMy().subscribe({
        next: projects => {
          this.memberProjects = projects.results.filter(project => !project.draft);
        },
      });

      this.subscriptions.push(memeberProjects$);
      this.subscriptions.push(profileDataSub$);
    } else {
      const profileDataSub$ = this.profileDataService
        .getProfile()
        .pipe(
          map(user => ({ ...user, progress: calculateProfileProgress(user!) })),
          filter(user => !!user)
        )
        .subscribe({
          next: user => {
            this.info.set(user);
            this.isProfileFill =
              user.progress! < 100 ? (this.isProfileFill = true) : (this.isProfileFill = false);
          },
        });

      this.isInProfileInfo();

      const profileLeaderProjectsSub$ = this.authService.getLeaderProjects().subscribe({
        next: (projects: ApiPagination<Project>) => {
          this.profileProjects.set(projects.results);
        },
      });

      this.subscriptions.push(profileDataSub$, profileLeaderProjectsSub$);
    }
  }

  private isInProfileInfo(): void {
    const profileInfoSub$ = this.authService.profile.subscribe({
      next: profile => {
        this.profile = profile;

        if (this.info() && this.listType === "project") {
          this.isInProject = this.info()
            ?.collaborators?.map((person: Collaborator) => person.userId)
            .includes(profile.id);
        }
      },
    });

    this.subscriptions.push(profileInfoSub$);
  }

  /**
   * Инициализация строки для back компонента в зависимости от типа данных
   */
  private initializeBackPath(): void {
    if (this.listType === "project") {
      this.backPath = "/office/projects/all";
    } else if (this.listType === "program") {
      this.backPath = "/office/program/all";
    }
  }

  private loadAdditionalFields(programId: number): void {
    const additionalFieldsSub$ = this.programService
      .getProgramProjectAdditionalFields(programId)
      .subscribe({
        next: ({ programFields }) => {
          if (programFields) {
            this.additionalFields.set(programFields);
          }
        },
      });

    this.subscriptions.push(additionalFieldsSub$);
  }
}
