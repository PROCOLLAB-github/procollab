/** @format */

import { Location } from "@angular/common";
import { computed, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { Collaborator } from "@domain/project/collaborator.model";
import { filter, Subject, takeUntil } from "rxjs";
import { DetailProfileInfoService } from "./profile/detail-profile-info.service";
import { DetailProjectInfoService } from "./project/detail-project-info.service";
import { DetailProgramInfoService } from "./program/detail-program-info.service";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { AppRoutes } from "@api/paths/app-routes";

@Injectable()
export class DetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getMyProjectsUseCase = inject(GetMyProjectsUseCase);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly authRepository = inject(AuthInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly location = inject(Location);
  private readonly detailProfileInfoService = inject(DetailProfileInfoService);
  private readonly detailProjectInfoService = inject(DetailProjectInfoService);
  private readonly detailProgramInfoService = inject(DetailProgramInfoService);

  private readonly destroy$ = new Subject<void>();
  private unsubscribeUrlChange?: () => void;

  readonly info = signal<any | undefined>(undefined);
  readonly listType = signal<"project" | "program" | "profile">("project");
  readonly projectForm = this.projectFormService.getForm();
  readonly isInProject = signal<boolean | undefined>(undefined);
  readonly memberProjects = this.detailProfileInfoService.memberProjects;
  readonly userType = signal<number | undefined>(undefined);
  readonly profile = this.detailProfileInfoService.profile;
  readonly queryCourseId = signal<number | null>(null);

  // Сигналы для работы с модальными окнами с текстом
  readonly errorMessageModal = signal("");

  // Сторонние переменные для работы с роутингом или доп проверок
  readonly backPath = signal<string | undefined>(undefined);

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
      project => project.leader === this.profile()?.id && project.partnerProgram?.id === programId
    );
  });

  initializationDetail(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.listType.set(data["listType"]);
      this.initializeBackPath();
      this.initializeInfo();
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
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
      currentUrl.includes("/projects") && !currentUrl.includes("/projects-rating")
    );

    this.detailProgramInfoService.applyUpdateStage("members", currentUrl.includes("/members"));

    this.detailProgramInfoService.applyUpdateStage(
      "projects-rating",
      currentUrl.includes("/projects-rating")
    );

    this.detailProjectInfoService.applyUpdateStage("team", currentUrl.includes("/team"));
    this.detailProjectInfoService.applyUpdateStage("vacancies", currentUrl.includes("/vacancies"));
    this.detailProjectInfoService.applyUpdateStage("chat", currentUrl.includes("/chat"));
    this.detailProjectInfoService.applyUpdateStage(
      "work-section",
      currentUrl.includes("/work-section")
    );

    this.detailProjectInfoService.applyUpdateStage(
      "gant-diagram",
      currentUrl.includes("/gant-diagram")
    );
    this.detailProjectInfoService.applyUpdateStage("kanban", currentUrl.includes("/kanban"));
  }

  private isInProfileInfo(): void {
    this.authRepository.profile
      .pipe(
        filter(profile => !!profile),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: profile => {
          this.detailProfileInfoService.applySetProfile(profile);

          if (this.info() && this.listType() === "project") {
            this.isInProject.set(
              this.info()
                ?.collaborators?.map((person: Collaborator) => person.userId)
                .includes(profile.id)
            );
          }
        },
      });
  }

  private initializeInfo() {
    if (this.listType() === "project") {
      const project = this.projectsDetailUIInfoService.project;
      this.info.set(project());

      this.detailProjectInfoService.applySetIsDisabled(this.info()?.partnerProgram?.isSubmitted);

      this.isInProfileInfo();
    } else if (this.listType() === "program") {
      const program = this.programDetailMainUIInfoService.program;
      this.info.set(program());

      this.authRepository.profile
        .pipe(
          filter(user => !!user),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: user => {
            this.userType.set(user!.userType);
            this.profile.set(user);
          },
        });

      this.getMyProjectsUseCase
        .execute()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: result => {
            if (!result.ok) {
              this.memberProjects.set([]);
              return;
            }

            this.memberProjects.set(result.value.results.filter(project => !project.draft));
          },
        });
    } else {
      this.detailProfileInfoService.initializationProfile();
      const user = this.profileDetailUIInfoService.user();

      this.info.set(user);

      this.isInProfileInfo();

      this.detailProfileInfoService.initializationLeaderProjects();
    }
  }

  destroy(): void {
    this.unsubscribeUrlChange?.();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
