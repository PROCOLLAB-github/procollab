/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit {
  constructor(private navService: NavService) {}
  arr = new Array(200).fill(1);

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");
  }
}
