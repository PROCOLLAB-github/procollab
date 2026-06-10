/** @format */

import { Location } from "@angular/common";
import { computed, DestroyRef, inject, Injectable, Injector, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "@domain/auth/user.model";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { Collaborator } from "@domain/project/collaborator.model";
import { filter } from "rxjs";
import { DetailProfileInfoService } from "./profile/detail-profile-info.service";
import { DetailProjectInfoService } from "./project/detail-project-info.service";
import { DetailProgramInfoService } from "./program/detail-program-info.service";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { AppRoutes } from "@api/paths/app-routes";

@Injectable()
export class DetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectFormService = inject(ProjectFormService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);

  private readonly detailProfileInfoService = inject(DetailProfileInfoService);
  private readonly detailProjectInfoService = inject(DetailProjectInfoService);
  private readonly detailProgramInfoService = inject(DetailProgramInfoService);

  private readonly getMyProjectsUseCase = inject(GetMyProjectsUseCase);

  private unsubscribeUrlChange?: () => void;

  readonly info = signal<any | undefined>(undefined);
  readonly listType = signal<"project" | "program" | "profile">("project");
  readonly projectForm = this.projectFormService.getForm();
  readonly memberProjects = this.detailProfileInfoService.memberProjects;
  readonly profile = this.detailProfileInfoService.profile;
  // userType вытягивается реактивно из текущего профиля: подписка раньше делалась
  // через authRepository.profile.pipe(...).subscribe(set), после миграции на сигнал
  // это просто computed — обновляется автоматически когда profile() придёт.
  readonly userType = computed(() => this.profile()?.personal.userType);
  readonly isInProject = computed<boolean | undefined>(() => {
    if (this.listType() !== "project" || !this.info()) return undefined;
    const myId = this.profile()?.id;
    if (myId === undefined) return undefined;
    return !!this.info()
      ?.collaborators?.map((person: Collaborator) => person.userId)
      .includes(myId);
  });
  readonly queryCourseId = signal<number | null>(null);
  readonly isProfileFill = this.profileDetailUIInfoService.isProfileFill;

  // Сигналы для работы с модальными окнами с текстом
  readonly errorMessageModal = signal("");

  // Сторонние переменные для работы с роутингом или доп проверок
  readonly backPath = signal<string | undefined>(undefined);

  readonly isContactsModalOpen = signal(false);
  readonly isMaterialsModalOpen = signal(false);

  readonly contactLinks = computed<{ label: string; url: string }[]>(() =>
    ((this.info()?.links as string[] | undefined) ?? []).map(link => ({ label: link, url: link })),
  );

  readonly materialLinks = computed<{ label: string; url: string }[]>(() =>
    ((this.info()?.materials as { title: string; url: string }[] | undefined) ?? []).map(m => ({
      label: m.title,
      url: m.url,
    })),
  );

  readonly isUserManager = computed(() => {
    if (this.listType() === "program") {
      return this.info()?.isUserManager;
    }
    return undefined;
  });

  readonly isUserMember = computed(() => {
    if (this.listType() === "program") {
      return this.info()?.isUserMember;
    }
    return undefined;
  });

  readonly isUserExpert = computed(() => {
    const type = this.userType();
    return type !== undefined && type === 3;
  });

  readonly isProjectAssigned = computed(() => {
    const programId = this.info()?.id;
    if (!programId) return false;

    return this.memberProjects().some(
      project => project.leader === this.profile()?.id && project.partnerProgram?.id === programId,
    );
  });

  initializationDetail(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.listType.set(data["listType"]);
      this.initializeBackPath();
      this.initializeInfo();
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const courseId = params["courseId"];
      this.queryCourseId.set(courseId ? Number(courseId) : null);
    });

    this.updatePageStates();
    this.unsubscribeUrlChange = this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(): void {
    switch (this.listType()) {
      case "profile":
        this.router.navigateByUrl(AppRoutes.profile.detail(this.info().id));
        break;

      case "project":
        this.router.navigateByUrl(AppRoutes.projects.detail(this.info().id));
        break;

      case "program":
        this.router.navigateByUrl(AppRoutes.program.detail(this.info().id));
        break;
    }
  }

  /**
   * Инициализация строки для back компонента в зависимости от типа данных
   */
  private initializeBackPath(): void {
    if (this.listType() === "project") {
      this.backPath.set(AppRoutes.projects.all());
    } else if (this.listType() === "program") {
      this.backPath.set(AppRoutes.program.list());
    }
  }

  /**
   * Обновляет состояния страниц на основе URL
   */
  private updatePageStates(url?: string): void {
    const currentUrl = url || this.router.url;

    this.detailProgramInfoService.applyUpdateStage(
      "projects",
      currentUrl.includes("/projects") && !currentUrl.includes("/projects-rating"),
    );

    this.detailProgramInfoService.applyUpdateStage("members", currentUrl.includes("/members"));

    this.detailProgramInfoService.applyUpdateStage(
      "projects-rating",
      currentUrl.includes("/projects-rating"),
    );

    this.detailProjectInfoService.applyUpdateStage("team", currentUrl.includes("/team"));
    this.detailProjectInfoService.applyUpdateStage("vacancies", currentUrl.includes("/vacancies"));
    this.detailProjectInfoService.applyUpdateStage("chat", currentUrl.includes("/chat"));
    this.detailProjectInfoService.applyUpdateStage(
      "work-section",
      currentUrl.includes("/work-section"),
    );

    this.detailProjectInfoService.applyUpdateStage(
      "gant-diagram",
      currentUrl.includes("/gant-diagram"),
    );
    this.detailProjectInfoService.applyUpdateStage("kanban", currentUrl.includes("/kanban"));
  }

  private initializeInfo() {
    if (this.listType() === "project") {
      const project = this.projectsDetailUIInfoService.project;
      this.info.set(project());

      this.detailProjectInfoService.applySetIsDisabled(this.info()?.partnerProgram?.isSubmitted);

      // isInProject теперь computed — пересчитается сам когда profile() и info() готовы.
    } else if (this.listType() === "program") {
      const program = this.programDetailMainUIInfoService.program;
      this.info.set(program());

      if (this.isUserMember() && (this.isUserExpert() || this.isUserManager())) return;

      if (this.isUserMember()) {
        if (!this.isProjectAssigned()) {
          this.getMyProjectsUseCase
            .execute()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: result => {
                if (!result.ok) {
                  this.memberProjects.set([]);
                  return;
                }

                this.memberProjects.set(result.value.results.filter(project => !project.draft));
              },
            });
        }
      }
    } else {
      this.detailProfileInfoService.initializationProfile();
      toObservable(this.profileDetailUIInfoService.user, { injector: this.injector })
        .pipe(
          filter((user): user is User => !!user),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(user => this.info.set(user));

      this.detailProfileInfoService.initializationLeaderProjects();
    }
  }

  destroy(): void {
    this.unsubscribeUrlChange?.();
  }
}
