/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent } from "@ui/components";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-program-head",
  templateUrl: "./program-head.component.html",
  styleUrl: "./program-head.component.scss",
  standalone: true,
  imports: [IconComponent, NgOptimizedImage],
})
export class ProgramHeadComponent implements OnInit {
  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {}

  @Input() program!: Program;

  ngOnInit(): void {}

  get searchValue(): string {
    return this.route.snapshot.queryParams["q"];
  }

  set searchValue(value: string) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: value } });
  }
}
