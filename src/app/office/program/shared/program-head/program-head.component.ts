/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent } from "@ui/components";

@Component({
  selector: "app-program-head",
  templateUrl: "./program-head.component.html",
  styleUrl: "./program-head.component.scss",
  standalone: true,
  imports: [IconComponent, ButtonComponent, RouterLink],
})
export class ProgramHeadComponent implements OnInit {
  constructor(public readonly router: Router, private readonly route: ActivatedRoute) {}

  @Input({ required: true }) program!: Program;

  ngOnInit(): void {}

  get searchValue(): string {
    return this.route.snapshot.queryParams["q"];
  }

  set searchValue(value: string) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: value } });
  }
}
