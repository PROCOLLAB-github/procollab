/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";

@Component({
  selector: "app-open-vacancy",
  standalone: true,
  imports: [CommonModule, ButtonComponent, DayjsPipe, RouterLink, TagComponent],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
})
export class OpenVacancyComponent {
  constructor(public readonly router: Router) {}
}
