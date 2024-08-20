/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { Task, TasksResponse } from "../../../models/skill.model";

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input({ required: true }) status!: TasksResponse["statsOfWeeks"][0];
}
