/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { DashboardItemComponent } from "../../../shared/dashboardItem/dashboardItem.component";
import { ProjectsDashboardInfoService } from "projects/social_platform/src/app/api/project/facades/dashboard/projects-dashboard-info.service";
import { ProjectsDashboardUIInfoService } from "projects/social_platform/src/app/api/project/facades/dashboard/ui/projects-dashboard-ui-info.service";
import { ProgramDetailListUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-list-ui-info.service";

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
  standalone: true,
})
export class DashboardProjectsComponent implements OnInit, OnDestroy {
  private readonly projectsDashboardInfoService = inject(ProjectsDashboardInfoService);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  protected readonly dashboardItems = this.projectsDashboardUIInfoService.dashboardItems;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  ngOnInit(): void {
    this.projectsDashboardInfoService.initializationDashboardItems();
  }

  ngOnDestroy(): void {
    this.projectsDashboardInfoService.destroy();
  }
}
