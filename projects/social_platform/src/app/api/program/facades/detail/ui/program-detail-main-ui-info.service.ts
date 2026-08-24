/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";
import { FeedNews } from "@domain/news/project-news.model";

/** Состояние интерфейса основной вкладки программы: данные программы, ссылки, новости и модалки. */
@Injectable()
export class ProgramDetailMainUIInfoService {
  readonly program = signal<Program | undefined>(undefined);
  readonly programId = signal<number | undefined>(undefined);

  readonly contactLinks = computed<{ label: string; url: string }[]>(() =>
    (this.program()?.links ?? []).map(link => ({ label: link, url: link })),
  );

  readonly materialLinks = computed<{ label: string; url: string }[]>(() =>
    (this.program()?.materials ?? []).map(m => ({ label: m.title, url: m.url })),
  );

  readonly totalNewsCount = signal(0);

  // Сигналы модальных окон основной вкладки.
  readonly showProgramModal = signal(false);
  readonly showProgramModalErrorMessage = signal<string | null>(null);
  readonly registeredProgramModal = signal<boolean>(false);
  readonly welcomeAcknowledgementPending = signal<boolean>(false);

  readonly registerDateExpired = signal<boolean>(false);

  applyInitProgramQueryParams(): void {
    this.applyProgramOpenModal("access");
  }

  applyInitProgram(
    news:
      | ApiPagination<FeedNews>
      | {
          results: unknown[];
          count: number;
        },
  ): void {
    if (news.results?.length) {
      this.totalNewsCount.set(news.count);
    }
  }

  applyFormatingProgramData(program: Program): void {
    this.program.set(program);
    this.registerDateExpired.set(Date.now() > Date.parse(program.datetimeRegistrationEnds));
    this.registeredProgramModal.set(program.isUserMember && program.welcomeAcknowledgedAt === null);
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

  applyProgramWelcomeAcknowledged(acknowledgedAt: string): void {
    this.program.update(program =>
      program
        ? Object.assign(new Program(), program, { welcomeAcknowledgedAt: acknowledgedAt })
        : program,
    );
    this.registeredProgramModal.set(false);
  }
}
