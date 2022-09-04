/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, pluck } from "rxjs";
import { Project } from "../../models/project.model";
import { IndustryService } from "../../services/industry.service";
import { Industry } from "../../models/industry.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute, public industryService: IndustryService) {}

  project$: Observable<Project> = this.route.data.pipe(pluck("data"));

  ngOnInit(): void {}

  getIndustry(industries: Industry[], industryId: number): Industry | undefined {
    return industries.find(industry => industry.id === industryId);
  }
}
