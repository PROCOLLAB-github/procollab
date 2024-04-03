/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {}
