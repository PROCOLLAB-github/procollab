/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { DirectionItem, directionItemBuilder } from "@utils/helpers/directionItemBuilder";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { ProjectsDetailUIInfoService } from "../../../../project/facades/detail/ui/projects-detail-ui.service";

@Injectable()
export class ProfileDetailUIInfoService {
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  readonly user = signal<User | undefined>(undefined);
  readonly loggedUserId = this.projectsDetailUIInfoService.loggedUserId;

  readonly isProfileEmpty = signal<boolean | undefined>(undefined);
  readonly isProfileFill = signal<boolean>(false);

  readonly directions = signal<DirectionItem[]>([]);
  readonly isShowModal = signal<boolean>(false);

  applyInitProfile(data: any): void {
    const userWithProgress = data["data"]["user"];
    this.initializationDirections(userWithProgress);
    this.user.set(userWithProgress);
    this.isProfileFill.set(userWithProgress.progress! < 100);
  }

  applyProfileEmpty(): void {
    this.isProfileEmpty.set(
      !(
        this.user()?.firstName &&
        this.user()?.lastName &&
        this.user()?.email &&
        this.user()?.avatar &&
        this.user()?.birthday
      )
    );
  }

  applyOpenWorkInfoModal(): void {
    this.isShowModal.set(true);
  }

  private initializationDirections(user: User): void {
    this.directions.set(
      directionItemBuilder(
        2,
        ["навыки", "достижения"],
        ["squiz", "medal"],
        [user.skills, user.achievements],
        ["array", "array"]
      )!
    );
  }
}
