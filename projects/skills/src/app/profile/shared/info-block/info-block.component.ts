/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: "app-info-block",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, RouterLink],
  templateUrl: "./info-block.component.html",
  styleUrl: "./info-block.component.scss",
})
export class InfoBlockComponent {
  router = inject(Router);
}
