/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ButtonComponent } from "../../primitives/button/button.component";
import { IconComponent } from "../../primitives/icon/icon.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-empty-manage-card",
  templateUrl: "./empty-manage-card.component.html",
  styleUrl: "./empty-manage-card.component.scss",
  imports: [CommonModule, ButtonComponent, IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyManageCardComponent {}
