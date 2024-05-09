/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConnectQuestion } from "../../../../models/skill.model";

@Component({
  selector: "app-relations-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./relations-task.component.html",
  styleUrl: "./relations-task.component.scss",
})
export class RelationsTaskComponent {
  @Input({ required: true }) data!: ConnectQuestion;
  protected readonly Array = Array;
}
