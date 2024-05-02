/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [BackComponent, RouterLinkActive, RouterLink, RouterOutlet],
})
export class ProgramDetailComponent implements OnInit {
  constructor(private readonly navService: NavService, private readonly route: ActivatedRoute) {}

  programId?: number;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.programId = this.route.snapshot.params["programId"];
  }
}
