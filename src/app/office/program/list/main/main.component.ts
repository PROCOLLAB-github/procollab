/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, Observable } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramCardComponent } from "../../shared/program-card/program-card.component";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";

@Component({
    selector: "app-main",
    templateUrl: "./main.component.html",
    styleUrl: "./main.component.scss",
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        ProgramCardComponent,
        AsyncPipe,
    ],
})
export class ProgramMainComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  programs$: Observable<Program[]> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r["results"])
  );

  ngOnInit(): void {}
}
