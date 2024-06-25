/** @format */

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WriteQuestion } from "../../../../models/step.model";
import { YtExtract } from "@corelib";

@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [CommonModule, YtExtract],
  templateUrl: "./write-task.component.html",
  styleUrl: "./write-task.component.scss",
})
export class WriteTaskComponent {
  @Input({ required: true }) data!: WriteQuestion;
  @Output() update = new EventEmitter<{ text: string }>();

  @Input() success = false;

  // result = signal<{ text: string } | null>(null);

  onKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement;

    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    this.update.emit({ text: target.value });
  }
}
