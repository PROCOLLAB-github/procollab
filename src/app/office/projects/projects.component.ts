/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";
import { ActivatedRoute } from "@angular/router";
import { Observable, pluck } from "rxjs";
import { ProjectCount } from "../models/project.model";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit {
  constructor(private navService: NavService, private route: ActivatedRoute) {}

  projectsCount$: Observable<ProjectCount> = this.route.data.pipe(pluck("data"));

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");
  }
}
