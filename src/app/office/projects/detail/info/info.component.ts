/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Project } from "../../../models/project.model";
import { IndustryService } from "../../../services/industry.service";
import { NavService } from "../../../services/nav.service";
import { Vacancy } from "../../../models/vacancy.model";
import { AuthService } from "../../../../auth/services";

@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class ProjectInfoComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public industryService: IndustryService,
    public authService: AuthService,
    private navService: NavService
  ) {}

  project$: Observable<Project> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r[0])
  );

  vacancies$: Observable<Vacancy[]> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r[1])
  );

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");
  }

  readFull = false;
}
