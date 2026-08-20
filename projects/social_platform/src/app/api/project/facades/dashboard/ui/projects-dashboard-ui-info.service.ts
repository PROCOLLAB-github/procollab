/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { DashboardItem, dashboardItemBuilder } from "@utils/dashboardItemBuilder";
import { Project } from "@domain/project/project.model";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ApiPagination } from "@domain/other/api-pagination.model";

/** UI-проекция дашборда проектов: computed-сигналы перечня. */
@Injectable()
export class ProjectsDashboardUIInfoService {
  private readonly profileInfoService = inject(ProfileInfoService);

  readonly dashboardItems = signal<DashboardItem[]>([]);

  applySetDashboardItems(
    all: ApiPagination<Project>,
    my: ApiPagination<Project>,
    subs: ApiPagination<Project>,
  ): void {
    this.profileInfoService.applyProfileSubsUpdated(subs.results);

    const allProjects = all.results.slice(0, 4);
    const myProjects = my.results.slice(0, 4);
    const subsProjects = subs.results.slice(0, 4);

    this.dashBoardItemsBuilder(myProjects, subsProjects, allProjects);
  }

  private dashBoardItemsBuilder(
    myProjects: Project[],
    subsProjects: Project[],
    allProjects: Project[],
  ): void {
    this.dashboardItems.set(
      dashboardItemBuilder(
        3,
        ["my", "subscriptions", "all"],
        ["мои проекты", "мои подписки", "витрина проектов"],
        ["main", "favourities", "folders"],
        [myProjects, subsProjects, allProjects],
      ),
    );
  }
}
