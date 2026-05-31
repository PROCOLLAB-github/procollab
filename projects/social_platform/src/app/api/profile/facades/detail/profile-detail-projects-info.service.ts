/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { Project } from "@domain/project/project.model";
import { ActivatedRoute } from "@angular/router";
import { ProfileDetailUIInfoService } from "./ui/profile-detail-ui-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад вкладки проектов профиля: проекты пользователя и подписки. */
@Injectable()
export class ProfileDetailProjectsInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.profileDetailUIInfoService.user;
  readonly loggedUserId = this.profileDetailUIInfoService.loggedUserId;
  readonly subs = signal<Project[] | undefined>(undefined);

  initializationProfileProjects(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => {
        this.applyInitProfileProjects(data);
      },
    });
  }

  private applyInitProfileProjects(data: any): void {
    this.user.set(data.user);
    this.profileDetailUIInfoService.applySetLoggedUserId("logged", data.user.id);
    this.subs.set(data.subs);
  }
}
