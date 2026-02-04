/** @format */

import { Location } from "@angular/common";
import { computed, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProgramDetailMainUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectFormService } from "projects/social_platform/src/app/api/project/project-form.service";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { filter, Subject } from "rxjs";
import { DetailProfileInfoService } from "./profile/detail-profile-info.service";
import { DetailProjectInfoService } from "./project/detail-project-info.service";
import { DetailProgramInfoService } from "./program/detail-program-info.service";

@Injectable()
export class DetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly authService = inject(AuthService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly location = inject(Location);
  private readonly detailProfileInfoService = inject(DetailProfileInfoService);
  private readonly detailProjectInfoService = inject(DetailProjectInfoService);
  private readonly detailProgramInfoService = inject(DetailProgramInfoService);

  private readonly destroy$ = new Subject<void>();

  readonly info = signal<any | undefined>(undefined);
  readonly listType = signal<"project" | "program" | "profile">("project");
  readonly projectForm = this.projectFormService.getForm();
  readonly isInProject = signal<boolean | undefined>(undefined);
  readonly memberProjects = this.detailProfileInfoService.memberProjects;
  readonly userType = signal<number | undefined>(undefined);
  readonly profile = this.detailProfileInfoService.profile;

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
    this.route.data.subscribe(data => {
      this.listType.set(data["listType"]);
      this.initializeBackPath();
      this.initializeInfo();
    });

    this.updatePageStates();
    this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(): void {
    switch (this.listType()) {
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

  /**
   * Инициализация строки для back компонента в зависимости от типа данных
   */
  private initializeBackPath(): void {
    if (this.listType() === "project") {
      this.backPath.set("/office/projects/all");
    } else if (this.listType() === "program") {
      this.backPath.set("/office/program/all");
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
    this.authService.profile.pipe(filter(profile => !!profile)).subscribe({
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

      this.authService.profile.pipe(filter(user => !!user)).subscribe({
        next: user => {
          this.userType.set(user!.userType);
          this.profile.set(user);
        },
      });

      this.projectService.getMy().subscribe({
        next: projects => {
          this.memberProjects.set(projects.results.filter(project => !project.draft));
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
