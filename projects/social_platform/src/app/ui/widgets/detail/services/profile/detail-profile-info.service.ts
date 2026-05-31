/** @format */

import { DestroyRef, inject, Injectable, Injector, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { saveFile } from "@utils/export-file";
import { SendForUserUseCase } from "@api/invite/use-cases/send-for-user.use-case";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { User } from "@domain/auth/user.model";
import { Project } from "@domain/project/project.model";
import { filter, take } from "rxjs";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Injectable()
export class DetailProfileInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly snackbarService = inject(SnackbarService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);

  private readonly downloadCvUseCase = inject(DownloadCvUseCase);
  private readonly sendForUserUseCase = inject(SendForUserUseCase);

  readonly inviteForm = this.projectTeamUIService.inviteForm;

  readonly profile = this.profileInfoService.profile;
  readonly profileProjects = signal<User["relations"]["projects"]>([]);
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

  initializationLeaderProjects(): void {
    const viewedId = Number(this.route.snapshot.params["id"]);

    // Профиль текущего юзера грузится асинхронно (office init), поэтому ждём его
    // реактивно, а не читаем сигнал синхронно — иначе гонка даёт null и запрос не идёт.
    toObservable(this.profileInfoService.profile, { injector: this.injector })
      .pipe(
        filter((user): user is User => !!user),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(currentUser => {
        // На своём профиле кнопка «пригласить» не показывается — грузить не нужно.
        if (currentUser.id === viewedId) return;
        this.profileInfoService.ensureLeaderProjectsLoaded();
      });

    toObservable(this.profileInfoService.leaderProjects, { injector: this.injector })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => this.profileProjects.set(projects));
  }

  initializationProfile(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => {
        this.profileDetailUIInfoService.applyInitProfile(r);
      },
    });

    const isProfileFill = this.profileDetailUIInfoService.isProfileFill();
    this.isProfileFill.set(isProfileFill);
  }

  onCopyLink(profileId: number): void {
    let fullUrl = "";

    // Формирование URL в зависимости от типа ресурса
    fullUrl = `${location.origin}/office/profile/${profileId}/`;

    // Копирование в буфер обмена
    navigator.clipboard.writeText(fullUrl).then(
      () => this.snackbarService.success("скопирован URL"),
      () => this.snackbarService.error("не удалось скопировать ссылку")
    );
  }

  onProjectRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedProjectId.set(+target.value);

    if (this.selectedProjectId) {
      this.memberProjects().find(project => project.id === this.selectedProjectId());
    }
  }

  inviteUser(): void {
    if (!this.profileProjects().length) {
      this.showNoProjectsModal.set(true);
    } else {
      this.showSendInviteModal.set(true);
    }
  }

  sendInvite(): void {
    const roleControl = this.inviteForm.get("role");
    const role = roleControl?.value;
    const userId = this.route.snapshot.params["id"];

    roleControl?.markAsTouched({ onlySelf: true });

    if (roleControl?.invalid || this.selectedProjectId() === null) {
      return;
    }

    this.sendForUserUseCase
      .execute({
        userId,
        projectId: this.selectedProjectId()!,
        role: role!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            const error = result.error.cause as { error?: { user?: string[] } } | undefined;
            const userErrors = error?.error?.user ?? [];

            if (userErrors[0]?.includes("проект относится к программе")) {
              this.showNoInProgramModal.set(true);
            } else if (userErrors[0]?.includes("активное приглашение")) {
              this.showActiveInviteModal.set(true);
            }
            return;
          }

          this.showSendInviteModal.set(false);
          this.showSuccessInviteModal.set(true);

          this.inviteForm.reset();
          this.selectedProjectId.set(null);
        },
      });
  }

  openSkills: Record<number, boolean> = {};

  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }

  downloadCV() {
    this.isSended.set(true);
    this.downloadCvUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.isSended.set(false);

          if (!result.ok) {
            const error = result.error.cause as { status?: number } | undefined;
            if (error?.status === 400) {
              this.isDelayModalOpen.set(true);
            }
            return;
          }

          saveFile(result.value, "cv", this.profile()?.firstName + " " + this.profile()?.lastName);
        },
        error: err => {
          this.isSended.set(false);
          if (err?.status === 400) {
            this.isDelayModalOpen.set(true);
          }
        },
      });
  }
}
