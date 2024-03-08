/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { DayjsPipe } from "projects/core";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import {} from "@angular/common";

@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, IconComponent, DayjsPipe],
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) program?: Program;

  ngOnInit(): void {}
}
