/** @format */

import { Injectable, signal } from "@angular/core";
import { DirectionItem, directionItemBuilder } from "@utils/directionItemBuilder";
import { User } from "@domain/auth/user.model";

/** Состояние интерфейса детальной страницы профиля и карточек направлений пользователя. */
@Injectable()
export class ProfileDetailUIInfoService {
  /** Просматриваемый профиль (НЕ logged-in user), заполняется из резолвера. */
  readonly user = signal<User | undefined>(undefined);
  readonly loggedUserId = signal<number>(0);
  readonly profileId = signal<number>(0); // ID текущего пользователя.

  readonly isProfileEmpty = signal<boolean | undefined>(undefined);
  readonly isProfileFill = signal<boolean>(false);

  readonly directions = signal<DirectionItem[]>([]);
  readonly isShowModal = signal<boolean>(false);

  applyInitProfile(data: any): void {
    const userWithProgress = data["data"]["user"] as User;
    this.user.set(userWithProgress);
    this.initializationDirections(userWithProgress);

    if (
      userWithProgress?.id !== undefined &&
      userWithProgress.relations.progress! < 100 &&
      !this.hasSeenProfileFillModal(userWithProgress.id)
    ) {
      this.isProfileFill.set(true);
      this.markSeenProfileFillModal(userWithProgress.id);
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
        this.user()?.personal.avatar &&
        this.user()?.personal.birthday
      ),
    );
  }

  applySetLoggedUserId(type: "logged" | "profile", profileId: number): void {
    type === "logged" ? this.loggedUserId.set(profileId) : this.profileId.set(profileId);
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
        [user.relations.skills, user.relations.achievements],
        ["array", "array"],
      )!.filter(item => !Array.isArray(item.about) || item.about.length > 0),
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
