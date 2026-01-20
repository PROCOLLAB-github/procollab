/** @format */

import { Injectable, signal } from "@angular/core";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";

@Injectable()
export class ProgramDetailMainUIInfoService {
  readonly program = signal<Program | undefined>(undefined);
  readonly programId = signal<number | undefined>(undefined);

  readonly totalNewsCount = signal(0);

  // Сигналы для работы с модальными окнами с текстом
  readonly showProgramModal = signal(false);
  readonly showProgramModalErrorMessage = signal<string | null>(null);

  readonly registerDateExpired = signal<boolean>(false);

  applyInitProgramQueryParams(): void {
    this.applyProgramOpenModal("access");
  }

  applyInitProgram(
    news:
      | ApiPagination<FeedNews>
      | {
          results: never[];
          count: number;
        }
  ): void {
    if (news.results?.length) {
      this.totalNewsCount.set(news.count);
    }
  }

  applyFormatingProgramData(program: any): void {
    this.program.set(program);
    this.registerDateExpired.set(Date.now() > Date.parse(program.datetimeRegistrationEnds));
  }

  applyProgramOpenModal(type: "access" | "error"): void {
    const errorText =
      type === "access"
        ? "У вас не доступа к этой вкладке!"
        : "Произошла ошибка при загрузке программы";

    this.showProgramModal.set(true);
    this.showProgramModalErrorMessage.set(errorText);
  }

  applyProgramCloseModal(): void {
    this.showProgramModal.set(false);
  }
}
