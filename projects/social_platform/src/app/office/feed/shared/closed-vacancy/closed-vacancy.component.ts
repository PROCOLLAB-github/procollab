/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";

@Component({
  selector: "app-closed-vacancy",
  standalone: true,
  imports: [CommonModule, ButtonComponent, DayjsPipe, RouterLink, TagComponent],
  templateUrl: "./closed-vacancy.component.html",
  styleUrl: "./closed-vacancy.component.scss",
})
export class ClosedVacancyComponent {
  constructor(public readonly router: Router) {}
}
