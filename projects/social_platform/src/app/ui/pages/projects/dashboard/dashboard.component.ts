/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { DashboardItemComponent } from "../../../shared/dashboardItem/dashboardItem.component";
import { DashboardItem, dashboardItemBuilder } from "@utils/helpers/dashboardItemBuilder";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  imports: [CommonModule, DashboardItemComponent],
  standalone: true,
})
export class DashboardProjectsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  dashboardItems: DashboardItem[] = [];
  profileProjSubsIds?: number[];

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    this.route.data.subscribe({
      next: ({ data: { all, my, subs } }) => {
        const allProjects = all.results.slice(0, 4);
        const myProjects = my.results.slice(0, 4);
        const mySubs = subs.results.slice(0, 4);
        this.profileProjSubsIds = subs.results.map((project: Project) => project.id);

        this.dashboardItems = dashboardItemBuilder(
          3,
          ["my", "subscriptions", "all"],
          ["мои проекты", "мои подписки", "витрина проектов"],
          ["main", "favourities", "folders"],
          [myProjects, mySubs, allProjects]
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
