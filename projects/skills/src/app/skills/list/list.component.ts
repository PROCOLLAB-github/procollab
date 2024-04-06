/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BackComponent, IconComponent } from "@uilib";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { SkillCardComponent } from "../shared/skill-card/skill-card.component";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CommonModule,
    BackComponent,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    ButtonComponent,
    SkillCardComponent,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class SkillsListComponent {
  protected readonly Array = Array;
  router = inject(Router);
}
