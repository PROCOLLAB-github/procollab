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

  applyInitProfile(data: any, currentUserId?: number): void {
    const userWithProgress = data["data"]["user"] as User;
    this.user.set(userWithProgress);
    this.initializationDirections(userWithProgress);

    if (
      currentUserId !== undefined &&
      userWithProgress?.id === currentUserId &&
      userWithProgress.relations.progress! < 100 &&
      userWithProgress.relations.profileFillPromptAcknowledgedAt === null
    ) {
      this.isProfileFill.set(true);
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

  applyProfileFillAcknowledged(acknowledgedAt: string): void {
    this.user.update(user =>
      user
        ? Object.assign(new User(), user, {
            relations: {
              ...user.relations,
              profileFillPromptAcknowledgedAt: acknowledgedAt,
            },
          })
        : user,
    );
    this.isProfileFill.set(false);
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
}
