/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, pluck } from "rxjs";
import { ProjectCount } from "../models/project.model";
import { ProjectService } from "../services/project.service";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit {
  constructor(
    private navService: NavService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");
  }

  projectsCount$: Observable<ProjectCount> = this.route.data.pipe(pluck("data"));

  isMy: Observable<boolean> = this.route.url.pipe(map(() => location.href.includes("/my")));

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit`)
        .then(() => console.debug("Route change from projects.component"));
    });
  }
}
