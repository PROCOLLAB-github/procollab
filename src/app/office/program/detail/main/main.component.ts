/** @format */

import { Component, OnInit } from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Program } from "@office/program/models/program.model";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class ProgramDetailMainComponent implements OnInit {
  constructor(
    private readonly programService: ProgramService,
    private readonly route: ActivatedRoute
  ) {}

  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  readFullDescription = false;
  ngOnInit(): void {}
}
