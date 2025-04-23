/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramCardComponent } from "../../shared/program-card/program-card.component";
import { AsyncPipe } from "@angular/common";
import { NavService } from "@office/services/nav.service";
import Fuse from "fuse.js";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [RouterLink, ProgramCardComponent, AsyncPipe],
})
export class ProgramMainComponent implements OnInit, OnDestroy {
  constructor(private readonly route: ActivatedRoute, private readonly navService: NavService) {}

  programCount = 0;

  programs: Program[] = [];
  searchedPrograms: Program[] = [];
  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    this.navService.setNavTitle("Программы");

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.programs, {
        keys: ["name"],
      });

      this.searchedPrograms = search ? fuse.search(search).map(el => el.item) : this.programs;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    const programs$ = this.route.data.pipe(map(r => r["data"])).subscribe(programs => {
      this.programCount = programs.count;
      this.programs = programs.results ?? [];
      this.searchedPrograms = programs.results ?? [];
    });

    programs$ && this.subscriptions$.push(programs$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }
}
