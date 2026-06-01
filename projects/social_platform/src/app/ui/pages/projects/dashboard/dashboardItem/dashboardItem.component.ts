/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  Output,
} from "@angular/core";
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
export class DashboardItemComponent implements OnInit {
  readonly title = input.required<string>();
  readonly arrayItems = input.required<Project[]>();
  readonly iconName = input.required<string>();
  readonly sectionName = input.required<string>();
  readonly profileProjSubsIds = input<number[]>();

  @Output() addProjectClick = new EventEmitter<void>();

  appereance: "base" | "subs" | "my" = "base";
  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    switch (this.iconName()) {
      case "favourities":
        this.appereance = "subs";
        break;

      case "main":
        this.appereance = "my";
        break;

      default:
        break;
    }
  }
}
