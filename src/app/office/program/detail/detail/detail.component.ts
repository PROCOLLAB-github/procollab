/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class ProgramDetailComponent implements OnInit {
  constructor(private readonly navService: NavService, private readonly route: ActivatedRoute) {}

  // program$ = this.route.data.pipe(map(r => r["data"]));
  programId?: number;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.programId = this.route.snapshot.params.programId;
  }
}
