/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { DayjsPipe } from "../../../../core/pipes/dayjs.pipe";
import { IconComponent } from "../../../../ui/components/icon/icon.component";
import { AvatarComponent } from "../../../../ui/components/avatar/avatar.component";
import { NgIf } from "@angular/common";

@Component({
    selector: "app-program-card",
    templateUrl: "./program-card.component.html",
    styleUrl: "./program-card.component.scss",
    standalone: true,
    imports: [
        NgIf,
        AvatarComponent,
        IconComponent,
        DayjsPipe,
    ],
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input() program?: Program;

  ngOnInit(): void {}
}
