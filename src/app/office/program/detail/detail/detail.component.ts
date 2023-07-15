/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class ProgramDetailComponent implements OnInit {
  constructor(private readonly navService: NavService) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");
  }
}
