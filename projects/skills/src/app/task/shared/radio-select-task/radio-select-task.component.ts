/** @format */

import { Component, Input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SingleQuestion } from "../../../../models/skill.model";

@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent {
  @Input({ required: true }) data!: SingleQuestion;
  //
  // options = signal([
  //   { id: "ds", label: "Профессиональные архитекторы" },
  //   { id: "dsdfs", label: "дети" },
  //   { id: "ds234234", label: "Выпускники бизнес-школ" },
  // ]);
}
