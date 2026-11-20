/** @format */

import { Injectable, inject, signal } from "@angular/core";

/** UI-состояние офиса: приглашения, пункты навигации и модалки верификации. */
@Injectable()
export class OfficeUIInfoService {
  readonly verificationAcknowledgementPending = signal<boolean>(false);
  readonly inviteErrorModal = signal<boolean>(false);

  readonly navItems = signal<
    {
      name: string;
      link: string;
      icon: string;
      isExternal?: boolean;
      isActive?: boolean;
      children?: { name: string; link: string; icon?: string; iconViewBox?: string }[];
    }[]
  >([]);

  applyOpenInviteErrorModal(): void {
    this.inviteErrorModal.set(true);
  }

  applyCreateNavItems(profileId: number): void {
    this.navItems.set([
      { name: "мой профиль", icon: "person", link: `profile/${profileId}` },
      { name: "новости", icon: "feed", link: "feed" },
      { name: "проекты", icon: "projects", link: "projects" },
      { name: "участники", icon: "people-bold", link: "members" },
      {
        name: "программы",
        icon: "program",
        link: "program/all",
        children: [
          {
            name: "я организую",
            link: "program/managed",
            icon: "settings",
            iconViewBox: "0 0 13 13",
          },
        ],
      },
      { name: "вакансии", icon: "search-sidebar", link: "vacancies" },
      { name: "курсы", icon: "trajectories", link: "courses" },
      // { name: "чаты", icon: "message", link: "chats" },
    ]);
  }
}
