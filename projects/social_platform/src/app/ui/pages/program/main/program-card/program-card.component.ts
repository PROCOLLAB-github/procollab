/** @format */

import { ChangeDetectionStrategy, Component, input, Input, OnInit } from "@angular/core";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { DatePipe, NgClass } from "@angular/common";
import { Program } from "@domain/program/program.model";

/** Карточка программы с краткой информацией для списков. */
@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  imports: [AvatarComponent, DatePipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCardComponent implements OnInit {
  readonly program = input.required<Program>();

  ngOnInit(): void {
    this.registerDateExpired = Date.now() > Date.parse(this.program().datetimeRegistrationEnds);
  }

  registerDateExpired?: boolean;
}
