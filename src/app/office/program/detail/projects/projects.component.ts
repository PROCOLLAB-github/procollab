/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Project } from "@models/project.model";
import { Program } from "@office/program/models/program.model";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProgramProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  projects$: Observable<Project[]> = this.route.data.pipe(map(r => r["data"]));
  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  ngOnInit(): void {}
}
