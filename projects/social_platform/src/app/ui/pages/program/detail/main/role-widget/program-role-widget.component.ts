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
  withoutProjectPresentation,
} from "@api/program/program-widget-presentation";
import { DetailProgramInfoService } from "@ui/widgets/detail/services/program/detail-program-info.service";

/** Компактный виджет только страницы программы. Габариты соответствуют исходному SoonCard. */
@Component({
  selector: "app-program-role-widget",
  imports: [RouterLink, MatTooltipModule],
  providers: [ProgramRoleWidgetService],
  templateUrl: "./program-role-widget.component.html",
  styleUrl: "./program-role-widget.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramRoleWidgetComponent {
  readonly service = inject(ProgramRoleWidgetService);
  private readonly applicationAction = inject(DetailProgramInfoService);
  readonly applicationPending = this.applicationAction.applicationPending;
  readonly state = this.service.state;
  readonly data = computed(() => {
    const state = this.state();
    return state.status === "success" ? state.data : null;
  });
  readonly roleNames = { organizer: "организатор", expert: "эксперт", participant: "участник" };
  readonly routes = AppRoutes;
  readonly steps = participantSteps;
  readonly withoutProject = withoutProjectPresentation;
  readonly now = signal(Date.now());
  readonly expertState = computed(() => {
    const data = this.data();
    return data?.role === "expert"
      ? expertWidgetPresentation(data.expert, data.isCompetitive, this.now())
      : null;
  });
  readonly errorMessages = {
    network: "Не удалось загрузить",
    forbidden: "Нет доступа",
    unauthorized: "Войдите в аккаунт",
    not_found: "Программа недоступна",
    integrity: "Данные проекта требуют проверки",
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
      !data.participant.participantProject &&
      data.participant.submissionOpen
    )
      this.applicationAction.addNewProject(data.programId);
  }
}
