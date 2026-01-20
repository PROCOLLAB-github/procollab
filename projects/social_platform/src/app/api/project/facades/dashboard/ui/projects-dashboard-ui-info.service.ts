/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { DashboardItem, dashboardItemBuilder } from "@utils/helpers/dashboardItemBuilder";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { ProgramDetailListUIInfoService } from "../../../../program/facades/detail/ui/program-detail-list-ui-info.service";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";

@Injectable()
export class ProjectsDashboardUIInfoService {
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  readonly dashboardItems = signal<DashboardItem[]>([]);

  private readonly profileSubs = this.programDetailListUIInfoService.profileSubscriptions;

  applySetDashboardItems(
    all: ApiPagination<Project>,
    my: ApiPagination<Project>,
    subs: ApiPagination<Project>
  ): void {
    this.profileSubs.set(subs.results);

    const allProjects = all.results.slice(0, 4);
    const myProjects = my.results.slice(0, 4);
    const subsProjects = subs.results.slice(0, 4);

    this.dashBoardItemsBuilder(allProjects, myProjects, subsProjects);
  }

  private dashBoardItemsBuilder(
    myProjects: Project[],
    subsProjects: Project[],
    allProjects: Project[]
  ): void {
    this.dashboardItems.set(
      dashboardItemBuilder(
        3,
        ["my", "subscriptions", "all"],
        ["мои проекты", "мои подписки", "витрина проектов"],
        ["main", "favourities", "folders"],
        [myProjects, subsProjects, allProjects]
      )
    );
  }
}
