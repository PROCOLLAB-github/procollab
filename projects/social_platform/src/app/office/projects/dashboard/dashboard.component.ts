/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Project } from "@office/models/project.model";
import { Subscription } from "rxjs";
import { DashboardItemComponent } from "./shared/dashboardItem/dashboardItem.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  imports: [CommonModule, DashboardItemComponent],
  standalone: true,
})
export class DashboardProjectsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  allProjects: Project[] = [];
  myProjects: Project[] = [];
  mySubs: Project[] = [];
  profileProjSubsIds?: number[];

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    this.route.data.subscribe({
      next: ({ data: { all, my, subs } }) => {
        this.allProjects = all.results.slice(0, 4);
        this.myProjects = my.results.filter((project: Project) => !project.draft).slice(0, 4);
        this.mySubs = subs.results.slice(0, 4);
        this.profileProjSubsIds = subs.results.map((project: Project) => project.id);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
