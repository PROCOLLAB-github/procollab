/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoSlide } from "../../../../models/skill.model";

@Component({
  selector: "app-info-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent {
  @Input({ required: true }) data!: InfoSlide;
}
