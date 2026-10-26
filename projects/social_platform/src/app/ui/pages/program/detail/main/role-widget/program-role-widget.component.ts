/** @format */

import { ButtonDirective } from "@uilib";
/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramRoleWidgetService } from "@api/program/facades/detail/program-role-widget.service";
import {
  expertWidgetPresentation,
  participantSteps,
} from "@api/program/program-widget-presentation";
import { DetailProgramInfoService } from "@ui/widgets/detail/services/program/detail-program-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";

/** Компактный виджет только страницы программы. Габариты соответствуют исходному SoonCard. */
@Component({
  selector: "app-program-role-widget",
  imports: [ButtonDirective, RouterLink, MatTooltipModule],
  providers: [ProgramRoleWidgetService],
  templateUrl: "./program-role-widget.component.html",
  styleUrl: "./program-role-widget.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramRoleWidgetComponent {
  readonly service = inject(ProgramRoleWidgetService);
  readonly program = inject(ProgramDetailMainUIInfoService).program;
  private readonly applicationAction = inject(DetailProgramInfoService);
  readonly applicationPending = this.applicationAction.applicationPending;
  readonly state = this.service.state;
  readonly data = computed(() => {
    const state = this.state();
    return state.status === "success" ? state.data : null;
  });
  readonly roleNames = { organizer: "организатор", expert: "эксперт", participant: "участник" };
  readonly participantView = computed(() => {
    const data = this.data();
    if (data?.role !== "participant") return null;
    if (data.storageMode === "solution") {
      const application = data.participant.application;
      return {
        ...data.participant,
        applicationLink: application
          ? {
              name: application.name,
              path: AppRoutes.program.solution(application.programId, application.solutionId),
              queryParams: {},
            }
          : null,
        label: "Решение",
        empty: "Решение не создано",
        stagesLabel: "Этапы решения",
      };
    }
    const project = data.participant.participantProject;
    return {
      ...data.participant,
      applicationLink: project
        ? {
            name: project.name,
            path: AppRoutes.projects.detail(project.id),
            queryParams: { programLinkId: project.programLinkId },
          }
        : null,
      label: "Проект",
      empty: "Проект не подан",
      stagesLabel: "Этапы проекта",
    };
  });
  readonly organizerView = computed(() => {
    const data = this.data();
    if (data?.role !== "organizer") return null;
    const solution = data.storageMode === "solution";
    return {
      participants: data.organizer.participants,
      submittedSolutions: data.organizer.submittedSolutions,
      workCount:
        data.storageMode === "solution" ? data.organizer.solutions : data.organizer.projects,
      withoutTeam:
        data.storageMode === "solution"
          ? data.organizer.participantsWithoutSolution
          : data.organizer.participantsWithoutProject,
      workLabel: solution ? "Решения" : "Проекты",
      withoutLabel: solution ? "Без команды" : "Без проектов",
      withoutDescription: solution ? "участников без команды" : "участников без проекта",
    };
  });
  readonly routes = AppRoutes;
  readonly steps = participantSteps;
  readonly now = signal(Date.now());
  readonly expertState = computed(() => {
    const data = this.data();
    return data?.role === "expert"
      ? expertWidgetPresentation(
          data.expert,
          data.isCompetitive,
          this.now(),
          data.storageMode === "solution" ? "solution" : "project",
        )
      : null;
  });
  readonly errorMessages = {
    network: "Не удалось загрузить",
    forbidden: "Нет доступа",
    unauthorized: "Войдите в аккаунт",
    not_found: "Программа недоступна",
    integrity: "Данные заявки требуют проверки",
  };
  constructor() {
    // Только локальные часы: никаких повторных HTTP-запросов. Пересечение дедлайна ≤1 с.
    const clock = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(clock));
  }
  count(value: number | null): string {
    return value === null
      ? "—"
      : new Intl.NumberFormat("ru-RU", {
          notation: value >= 10000 ? "compact" : "standard",
          maximumFractionDigits: 1,
        }).format(value);
  }
  createApplication(): void {
    const data = this.data();
    if (
      data?.role === "participant" &&
      !this.participantView()?.applicationLink &&
      data.participant.submissionOpen
    )
      this.applicationAction.addNewProject(data.programId);
  }
}
