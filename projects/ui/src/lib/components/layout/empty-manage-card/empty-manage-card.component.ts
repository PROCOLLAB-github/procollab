/** @format */

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-empty-manage-card",
  templateUrl: "./empty-manage-card.component.html",
  styleUrl: "./empty-manage-card.component.scss",
  imports: [CommonModule, ButtonComponent, IconComponent, RouterLink],
  standalone: true,
})
export class EmptyManageCardComponent {}
