/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, pluck } from "rxjs";
import { Project } from "../../models/project.model";
import { IndustryService } from "../../services/industry.service";
import { NavService } from "../../services/nav.service";
import { Vacancy } from "../../models/vacancy.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public industryService: IndustryService,
    private navService: NavService
  ) {}

  project$: Observable<Project> = this.route.data.pipe(pluck("data"), pluck(0));
  vacancies$: Observable<Vacancy[]> = this.route.data.pipe(pluck("data"), pluck(1));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");
  }

  readFull = false;
}
