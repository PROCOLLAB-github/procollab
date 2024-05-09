/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExcludeQuestion } from "../../../../models/skill.model";

@Component({
  selector: "app-exclude-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
})
export class ExcludeTaskComponent {
  @Input({ required: true }) data!: ExcludeQuestion;
}
