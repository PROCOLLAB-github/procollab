/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { ProjectsDetailUIInfoService } from "../../detail/ui/projects-detail-ui.service";

/** Состояние интерфейса редактирования проекта: модалки, конкурсная программа и флаги шага. */
@Injectable()
export class ProjectsEditUIInfoService {
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  // ID лидера проекта.
  readonly leaderId = signal<number>(0);
  readonly fromProgram = signal<string>("");
  readonly fromProgramOpen = signal<boolean>(false);
  readonly projectId = this.projectsDetailUIInfoService.projectId;

  // Маркер привязки проекта к конкурсной программе.
  readonly isCompetitive = signal<boolean>(false);
  readonly isProjectAssignToProgram = signal<boolean>(false);

  // Состояния модалок и ограничений редактирования.
  readonly isCompleted = signal<boolean>(false);
  readonly isSendDescisionLate = signal<boolean>(false);
  readonly isSendDescisionToPartnerProgramProject = signal<boolean>(false);
  readonly isAssignProjectToProgramModalOpen = signal<boolean>(false);

  // Маркер активной привязки проекта.
  readonly isProjectBoundToProgram = signal<boolean>(false);

  // Сигналы модалок с ошибкой.
  readonly errorModalMessage = signal<{
    program_name: string;
    whenCanEdit: string;
    daysUntilResolution: string;
  } | null>(null);

  readonly onEditClicked = signal<boolean>(false);
  readonly warningModalSeen = signal<boolean>(false);

  // Сигнал модалки с текстом о привязке проекта.
  readonly assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);

  applyOpenAssignProjectModal(r: any): void {
    this.assignProjectToProgramModalMessage.set(r);
    this.isAssignProjectToProgramModalOpen.set(true);
  }

  applySendDescision(): void {
    this.isSendDescisionToPartnerProgramProject.set(true);
  }

  applyCloseSendDescisionModal(): void {
    this.isSendDescisionToPartnerProgramProject.set(false);
  }

  // Методы для работы с модальными окнами
  applyCloseWarningModal(): void {
    this.warningModalSeen.set(true);
  }

  closeAssignProjectToProgramModal(): void {
    this.isAssignProjectToProgramModalOpen.set(false);
  }

  private getFromProgramSeenKey(): string {
    return `project_fromProgram_modal_seen_${this.projectId()}`;
  }

  hasSeenFromProgramModal(): boolean {
    try {
      return !!localStorage.getItem(this.getFromProgramSeenKey());
    } catch (e) {
      return false;
    }
  }

  markSeenFromProgramModal(): void {
    try {
      localStorage.setItem(this.getFromProgramSeenKey(), "1");
    } catch (e) {}
  }

  closeFromProgramModal(): void {
    this.fromProgramOpen.set(false);
    this.markSeenFromProgramModal();
  }

  applyOpenSendDescisionLateModal(): void {
    this.isSendDescisionLate.set(true);
  }
}
