/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";

/** Карточка проекта в дашборде. */
@Component({
  selector: "app-dashboard-item",
  templateUrl: "./dashboardItem.component.html",
  styleUrl: "./dashboardItem.component.scss",
  imports: [CommonModule, IconComponent, RouterLink, InfoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemComponent {
  readonly title = input.required<string>();
  readonly arrayItems = input.required<Project[]>();
  readonly iconName = input.required<string>();
  readonly sectionName = input.required<string>();
  readonly profileProjSubsIds = input<number[]>();

  readonly addProjectClick = output<void>();

  /** Раздел задаёт контекст независимо от декоративной иконки и обновляется вместе с input. */
  readonly appereance = computed(() =>
    this.sectionName() === "my" ? "my" : this.sectionName() === "subscriptions" ? "subs" : "base",
  );
  protected readonly AppRoutes = AppRoutes;
}
