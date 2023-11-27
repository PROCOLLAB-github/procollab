/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Program } from "@office/program/models/program.model";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
})
export class ProgramMainComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  programs$: Observable<Program[]> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r["results"])
  );

  ngOnInit(): void {}
}
