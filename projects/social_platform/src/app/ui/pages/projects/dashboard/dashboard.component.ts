/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { DashboardItemComponent } from "./dashboardItem/dashboardItem.component";
import { ProjectsDashboardInfoService } from "@api/project/facades/dashboard/projects-dashboard-info.service";
import { ProjectsDashboardUIInfoService } from "@api/project/facades/dashboard/ui/projects-dashboard-ui-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";

/** Дашборд проектов пользователя. */
@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
    imports: [CommonModule, DashboardItemComponent],
    providers: [
        ProjectsDashboardInfoService,
        ProjectsDashboardUIInfoService,
        ProgramDetailListUIInfoService,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProjectsComponent implements OnInit {
  private readonly projectsDashboardInfoService = inject(ProjectsDashboardInfoService);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  protected readonly dashboardItems = this.projectsDashboardUIInfoService.dashboardItems;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  ngOnInit(): void {
    this.projectsDashboardInfoService.initializationDashboardItems();
  }

  onAddProject(): void {
    this.projectsDashboardInfoService.addProject();
  }
}
