/** @format */

import { Injectable, inject, signal } from "@angular/core";

/** UI-состояние офиса: приглашения, пункты навигации и модалки верификации. */
@Injectable()
export class OfficeUIInfoService {
  readonly waitVerificationModal = signal<boolean>(false);
  readonly waitVerificationAccepted = signal<boolean>(false);
  readonly inviteErrorModal = signal<boolean>(false);

  readonly navItems = signal<
    { name: string; link: string; icon: string; isExternal?: boolean; isActive?: boolean }[]
  >([]);

  applyVerificationModal(): void {
    // Не показываем модалку, если пользователь уже принял подтверждение
    if (localStorage.getItem("waitVerificationAccepted") === "true") {
      // eslint-disable-next-line no-useless-return
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

  applyCreateNavItems(profileId: number): void {
    this.navItems.set([
      { name: "мой профиль", icon: "person", link: `profile/${profileId}` },
      { name: "новости", icon: "feed", link: "feed" },
      { name: "проекты", icon: "projects", link: "projects" },
      { name: "участники", icon: "people-bold", link: "members" },
      { name: "программы", icon: "program", link: "program" },
      { name: "вакансии", icon: "search-sidebar", link: "vacancies" },
      { name: "курсы", icon: "trajectories", link: "courses" },
      // { name: "чаты", icon: "message", link: "chats" },
    ]);
  }
}
