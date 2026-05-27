/** @format */

import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { DatePipe, NgClass } from "@angular/common";
import { Program } from "@domain/program/program.model";

/** Карточка программы с краткой информацией для списков. */
@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, IconComponent, DatePipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) program?: Program;

  ngOnInit(): void {
    this.registerDateExpired = Date.now() > Date.parse(this.program!.datetimeRegistrationEnds);
  }

  registerDateExpired?: boolean;
}
