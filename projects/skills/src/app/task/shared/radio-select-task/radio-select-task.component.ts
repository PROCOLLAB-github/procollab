/** @format */

import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SingleQuestion, SingleQuestionError } from "../../../../models/step.model";

@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent {
  @Input({ required: true }) data!: SingleQuestion;
  @Input() success = false;
  @Input()
  set error(value: SingleQuestionError | null) {
    this._error.set(value);

    if (value !== null) {
      this.result.set({ answerId: null });
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<{ answerId: number }>();

  result = signal<{ answerId: number | null }>({ answerId: null });
  _error = signal<SingleQuestionError | null>(null);

  onSelect(id: number) {
    this.result.set({ answerId: id });

    this.update.emit({ answerId: id });
  }
}
