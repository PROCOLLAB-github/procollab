/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { BarComponent } from "@ui/components";

@Component({
  selector: "app-rate-projects",
  templateUrl: "./rate-projects.component.html",
  styleUrl: "./rate-projects.component.scss",
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet, BackComponent, BarComponent],
})
export class RateProjectsComponent implements OnInit {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
  ) {}

  programId?: number;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.programId = this.route.snapshot.params["programId"];
  }
}
