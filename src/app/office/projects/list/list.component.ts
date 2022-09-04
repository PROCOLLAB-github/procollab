/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Observable, pluck } from "rxjs";
import { AuthService } from "../../../auth/services";
import { Project } from "../../models/project.model";
import { User } from "../../../auth/models/user.model";
import { NavService } from "../../services/nav.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ProjectsListComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navService: NavService
  ) {}

  projects$: Observable<{ project: Project; isBasket: boolean }[]> = combineLatest([
    this.route.data.pipe(pluck("data")),
    this.authService.profile,
  ]).pipe(
    map(([projects, profile]: [Project[], User]) => {
      return projects.map(project => ({ project, isBasket: profile.id === project.leaderId }));
    })
  );

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");
  }
}
