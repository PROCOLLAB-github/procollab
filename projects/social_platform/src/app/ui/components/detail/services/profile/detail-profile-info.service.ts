/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ValidationService } from "@corelib";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { saveFile } from "@utils/helpers/export-file";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProjectTeamUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-team-ui.service";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class DetailProfileInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly snackbarService = inject(SnackbarService);
  private readonly validationService = inject(ValidationService);
  private readonly inviteService = inject(InviteService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly authService = inject(AuthService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);

  private readonly destroy$ = new Subject<void>();

  readonly inviteForm = this.projectTeamUIService.inviteForm;

  readonly profile = signal<User | undefined>(undefined);
  readonly profileProjects = signal<User["projects"]>([]);
  readonly isSended = signal<boolean>(false);
  readonly isProfileFill = signal<boolean>(false);
  readonly showApproveSkillModal = signal<boolean>(false);
  readonly showSendInviteModal = signal<boolean>(false);
  readonly showNoProjectsModal = signal<boolean>(false);
  readonly showActiveInviteModal = signal<boolean>(false);
  readonly showNoInProgramModal = signal<boolean>(false);
  readonly showSuccessInviteModal = signal<boolean>(false);
  readonly isDelayModalOpen = signal<boolean>(false);

  // Переменные для работы с модалкой подачи проекта
  readonly selectedProjectId = signal<number | null>(null);
  readonly memberProjects = signal<Project[]>([]);

  initializationProfile(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.profileDetailUIInfoService.applyInitProfile(r);
      },
    });

    const isProfileFill = this.profileDetailUIInfoService.isProfileFill();
    this.isProfileFill.set(isProfileFill);
  }

  initializationLeaderProjects(): void {
    this.authService
      .getLeaderProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects: ApiPagination<Project>) => {
          this.profileProjects.set(projects.results);
        },
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  /**
   * Обработчик изменения радио-кнопки для выбора проекта
   */
  onProjectRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedProjectId.set(+target.value);

    if (this.selectedProjectId) {
      this.memberProjects().find(project => project.id === this.selectedProjectId());
    }
  }

  /**
   * Открывает модалку для отправки приглашения пользователю
   * Проверяет какие отрендерить проекты где profile.id === leader
   */
  inviteUser(): void {
    if (!this.profileProjects().length) {
      this.showNoProjectsModal.set(true);
    } else {
      this.showSendInviteModal.set(true);
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

    this.inviteService
      .sendForUser(userId, this.selectedProjectId()!, role!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSendInviteModal.set(false);
          this.showSuccessInviteModal.set(true);

          this.inviteForm.reset();
          this.selectedProjectId.set(null);
        },
        error: err => {
          if (err.error.user[0].includes("проект относится к программе")) {
            this.showNoInProgramModal.set(true);
          } else if (err.error.user[0].includes("активное приглашение")) {
            this.showActiveInviteModal.set(true);
          }
        },
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
    this.isSended.set(true);
    this.authService
      .downloadCV()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          saveFile(blob, "cv", this.profile()?.firstName + " " + this.profile()?.lastName);
          this.isSended.set(false);
        },
        error: err => {
          this.isSended.set(false);
          if (err.status === 400) {
            this.isDelayModalOpen.set(true);
          }
        },
      });
  }

  applySetProfile(profile: User): void {
    this.profile.set(profile);
  }
}
