/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { DirectionItem, directionItemBuilder } from "@utils/directionItemBuilder";
import { User } from "@domain/auth/user.model";
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

    if (
      this.user()?.id !== undefined &&
      this.user()!.progress! < 100 &&
      !this.hasSeenProfileFillModal(this.user()!.id)
    ) {
      this.isProfileFill.set(true);
      this.markSeenProfileFillModal(this.user()!.id);
    } else {
      this.isProfileFill.set(false);
    }
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
      )!.filter(item => !Array.isArray(item.about) || item.about.length > 0)
    );
  }

  private getProfileFillSeenKey(userId: number): string {
    return `profile_${userId}_fill_modal_seen`;
  }

  private hasSeenProfileFillModal(userId: number): boolean {
    try {
      return !!localStorage.getItem(this.getProfileFillSeenKey(userId));
    } catch (e) {
      return false;
    }
  }

  private markSeenProfileFillModal(userId: number): void {
    try {
      localStorage.setItem(this.getProfileFillSeenKey(userId), "1");
    } catch (e) {
      // ignore storage errors
    }
  }
}
