/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { Project } from "../../../../domain/project/project.model";
import { ActivatedRoute } from "@angular/router";
import { ProjectsDetailUIInfoService } from "../../../project/facades/detail/ui/projects-detail-ui.service";
import { ProfileDetailUIInfoService } from "./ui/profile-detail-ui-info.service";

@Injectable()
export class ProfileDetailProjectsInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly destroy$ = new Subject<void>();

  readonly user = this.profileDetailUIInfoService.user;
  readonly loggedUserId = this.projectsDetailUIInfoService.loggedUserId;
  readonly subs = signal<Project[] | undefined>(undefined);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationProfileProjects(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ data }) => {
        this.applyInitProfileProjects(data);
      },
    });
  }

  private applyInitProfileProjects(data: any): void {
    this.user.set(data.user);
    this.projectsDetailUIInfoService.applySetLoggedUserId("logged", data.user.id);
    this.subs.set(data.subs);
  }
}
