/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AuthService } from "@auth/services";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-program-head",
  templateUrl: "./program-head.component.html",
  styleUrl: "./program-head.component.scss",
  standalone: true,
  imports: [IconComponent, ButtonComponent, RouterLink, AsyncPipe],
})
export class ProgramHeadComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  @Input({ required: true }) program!: Program;

  isUserExpert = this.authService.profile.pipe(map(user => !!user.expert));

  isProjectsList = this.router.url.includes("projects");

  ngOnInit(): void {}

  get searchValue(): string {
    return this.route.snapshot.queryParams["q"];
  }

  set searchValue(value: string) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: value } });
  }
}
