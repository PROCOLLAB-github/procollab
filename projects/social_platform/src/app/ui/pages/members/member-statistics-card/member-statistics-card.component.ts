/** @format */

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { MemberStatistics } from "@domain/member/member-statistics.model";
import { AsyncState } from "@domain/shared/async-state";
import { IconComponent } from "@ui/primitives/icon/icon.component";

/** Три глобальные метрики: одна разметка для узкого sidebar и мобильной сетки. */
@Component({
  selector: "app-member-statistics-card",
  imports: [IconComponent],
  templateUrl: "./member-statistics-card.component.html",
  styleUrl: "./member-statistics-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberStatisticsCardComponent {
  readonly state = input.required<AsyncState<MemberStatistics>>();
  private readonly formatter = new Intl.NumberFormat("ru-RU");
  protected readonly rows = computed(() => {
    const state = this.state();
    const value = (key: keyof MemberStatistics) =>
      state.status === "success" ? this.formatter.format(state.data[key]) : "—";
    return [
      {
        key: "total",
        label: "Всего участников",
        icon: "people",
        viewBox: "0 0 24 24",
        value: value("total"),
      },
      {
        key: "projects",
        label: "В проектах",
        icon: "projects",
        viewBox: "0 0 10 11",
        value: value("inProjects"),
      },
      {
        key: "programs",
        label: "В программах",
        icon: "academic-hat",
        viewBox: "0 0 28 15",
        value: value("inPrograms"),
      },
    ];
  });
  protected readonly status = computed(() => {
    switch (this.state().status) {
      case "success":
        return "Статистика участников загружена";
      case "failure":
        return "Не удалось загрузить статистику участников";
      default:
        return "Загрузка статистики участников";
    }
  });
}
