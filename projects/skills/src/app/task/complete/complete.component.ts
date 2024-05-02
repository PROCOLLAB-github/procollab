/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";

@Component({
  selector: "app-complete",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, IconComponent, ButtonComponent],
  templateUrl: "./complete.component.html",
  styleUrl: "./complete.component.scss",
})
export class TaskCompleteComponent {}
