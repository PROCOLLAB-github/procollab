/** @format */

import { Injectable, inject, signal } from "@angular/core";

/** UI-состояние офиса: приглашения, пункты навигации и модалки верификации. */
@Injectable()
export class OfficeUIInfoService {
  readonly waitVerificationModal = signal<boolean>(false);
  readonly verificationAcknowledgementPending = signal<boolean>(false);
  readonly inviteErrorModal = signal<boolean>(false);

  readonly navItems = signal<
    { name: string; link: string; icon: string; isExternal?: boolean; isActive?: boolean }[]
  >([]);

  applyOpenVerificationModal(): void {
    this.waitVerificationModal.set(true);
  }

  applyOpenInviteErrorModal(): void {
    this.inviteErrorModal.set(true);
  }

  applyVerificationAcknowledged(): void {
    this.waitVerificationModal.set(false);
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
