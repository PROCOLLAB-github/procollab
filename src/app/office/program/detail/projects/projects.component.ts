/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, Observable } from "rxjs";
import { Project } from "@models/project.model";
import { Program } from "@office/program/models/program.model";
import { ProjectCardComponent } from "@office/shared/project-card/project-card.component";
import { ProgramHeadComponent } from "../../shared/program-head/program-head.component";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [NgIf, ProgramHeadComponent, NgFor, RouterLink, ProjectCardComponent, AsyncPipe],
})
export class ProgramProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  projects$: Observable<Project[]> = this.route.data.pipe(map(r => r["data"]));
  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  ngOnInit(): void {}
}
