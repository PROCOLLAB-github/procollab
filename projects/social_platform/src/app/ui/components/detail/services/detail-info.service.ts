/** @format */

import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class DetailInfoService {
  destroy$ = new Subject<void>();

  info = signal<any | undefined>(undefined);
  listType: "project" | "program" | "profile" = "project";

  // Сторонние переменные для работы с роутингом или доп проверок
  backPath?: string;
  isInProject?: boolean;

  // для проекта
  isTeamPage = signal<boolean>(false);
  isVacanciesPage = signal<boolean>(false);
  isProjectChatPage = signal<boolean>(false);
  isProjectWorkSectionPage = signal<boolean>(false);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
