/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";
import { FeedNews } from "@domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class ProgramDetailMainUIInfoService {
  readonly program = signal<Program | undefined>(undefined);
  readonly programId = signal<number | undefined>(undefined);

  readonly contactLinks = computed<{ label: string; url: string }[]>(() =>
    (this.program()?.links ?? []).map(link => ({ label: link, url: link }))
  );

  readonly materialLinks = computed<{ label: string; url: string }[]>(() =>
    (this.program()?.materials ?? []).map(m => ({ label: m.title, url: m.url }))
  );

  readonly totalNewsCount = signal(0);

  // Сигналы для работы с модальными окнами с текстом
  readonly showProgramModal = signal(false);
  readonly showProgramModalErrorMessage = signal<string | null>(null);
  readonly registeredProgramModal = signal<boolean>(false);

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
        }
  ): void {
    if (news.results?.length) {
      this.totalNewsCount.set(news.count);
    }
  }

  applyFormatingProgramData(program: Program): void {
    this.program.set(program);
    this.registerDateExpired.set(Date.now() > Date.parse(program.datetimeRegistrationEnds));
    if (program.isUserMember) {
      const seen = this.hasSeenRegisteredProgramModal(program.id);
      if (!seen) {
        this.registeredProgramModal.set(true);
        this.markSeenRegisteredProgramModal(program.id);
      }
    }
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

  private getRegisteredProgramSeenKey(programId: number): string {
    return `program_registered_modal_seen_${programId}`;
  }

  private hasSeenRegisteredProgramModal(programId: number): boolean {
    try {
      return !!localStorage.getItem(this.getRegisteredProgramSeenKey(programId));
    } catch (e) {
      return false;
    }
  }

  private markSeenRegisteredProgramModal(programId: number): void {
    try {
      localStorage.setItem(this.getRegisteredProgramSeenKey(programId), "1");
    } catch (e) {}
  }
}
