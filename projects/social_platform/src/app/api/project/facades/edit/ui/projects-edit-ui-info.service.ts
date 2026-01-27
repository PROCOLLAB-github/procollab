/** @format */

import { Injectable, signal } from "@angular/core";
import { ProjectAssign } from "projects/social_platform/src/app/domain/project/project-assign.model";

@Injectable()
export class ProjectsEditUIInfoService {
  // Id Лидера проекта
  readonly leaderId = signal<number>(0);
  readonly fromProgram = signal<string>("");

  // Маркер того является ли проект привязанный к конкурсной программе
  readonly isCompetitive = signal<boolean>(false);
  readonly isProjectAssignToProgram = signal<boolean>(false);

  // Состояние компонента
  readonly isCompleted = signal<boolean>(false);
  readonly isSendDescisionToPartnerProgramProject = signal<boolean>(false);
  readonly isAssignProjectToProgramModalOpen = signal<boolean>(false);

  // Маркер что проект привязан
  readonly isProjectBoundToProgram = signal<boolean>(false);

  // Сигналы для работы с модальными окнами с ошибкой
  readonly errorModalMessage = signal<{
    program_name: string;
    whenCanEdit: string;
    daysUntilResolution: string;
  } | null>(null);

  readonly onEditClicked = signal<boolean>(false);
  readonly warningModalSeen = signal<boolean>(false);

  // Сигналы для работы с модальными окнами с текстом
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
}
