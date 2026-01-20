/** @format */

import { Injectable, signal } from "@angular/core";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";

@Injectable()
export class OfficeUIInfoService {
  readonly invites = signal<Invite[]>([]);

  readonly waitVerificationModal = signal<boolean>(false);
  readonly waitVerificationAccepted = signal<boolean>(false);
  readonly inviteErrorModal = signal<boolean>(false);

  readonly navItems = signal<
    { name: string; link: string; icon: string; isExternal?: boolean; isActive?: boolean }[]
  >([]);

  applyVerificationModal(): void {
    // Не показываем модалку, если пользователь уже принял подтверждение
    if (localStorage.getItem("waitVerificationAccepted") === "true") {
      return;
    }
  }

  applyOpenVerificationModal(): void {
    this.waitVerificationModal.set(true);
  }

  applyOpenInviteErrorModal(): void {
    this.inviteErrorModal.set(true);
  }

  applyAcceptWaitVerification() {
    this.waitVerificationAccepted.set(true);
    localStorage.setItem("waitVerificationAccepted", "true");
  }

  applySetInvites(invites: any): void {
    this.invites.set(invites);
  }

  applyCreateNavItems(profileId: number): void {
    this.navItems.set([
      { name: "мой профиль", icon: "person", link: `profile/${profileId}` },
      { name: "новости", icon: "feed", link: "feed" },
      { name: "проекты", icon: "projects", link: "projects" },
      { name: "участники", icon: "people-bold", link: "members" },
      { name: "программы", icon: "program", link: "program" },
      { name: "вакансии", icon: "search-sidebar", link: "vacancies" },
      {
        name: "траектории",
        icon: "trajectories",
        link: "skills",
        isExternal: true,
        isActive: false,
      },
      { name: "чаты", icon: "message", link: "chats" },
    ]);
  }
}
