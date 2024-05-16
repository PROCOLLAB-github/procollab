/** @format */

import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExcludeQuestion, ExcludeQuestionResponse } from "../../../../models/step.model";

@Component({
  selector: "app-exclude-task",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
})
export class ExcludeTaskComponent {
  @Input({ required: true }) data!: ExcludeQuestion;
  @Output() update = new EventEmitter<number[]>();

  @Input() success = false;
  @Input()
  set error(value: ExcludeQuestionResponse | null) {
    this._error.set(value);

    value !== null && this.result.set([]);
  }

  get error() {
    return this._error();
  }

  result = signal<number[]>([]);
  _error = signal<ExcludeQuestionResponse | null>(null);

  onSelect(id: number) {
    if (this.result().includes(id)) {
      this.result.set(this.result().filter(i => i !== id));
    } else {
      this.result.set([...this.result(), id]);
    }

    this.update.emit(this.result());
  }
}
