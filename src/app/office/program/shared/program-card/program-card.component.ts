/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";

@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input() program?: Program;

  ngOnInit(): void {}
}
