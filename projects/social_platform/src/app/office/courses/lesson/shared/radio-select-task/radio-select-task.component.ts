/** @format */

import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe } from "@corelib";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { Task } from "@office/models/courses.model";

@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent {
  @Input({ required: true }) data!: Task;
  @Input() success = false;
  @Input() hint = "";

  @Input()
  set error(value: boolean) {
    this._error.set(value);

    if (value) {
      setTimeout(() => {
        this.result.set({ answerId: null });
        this._error.set(false);
      }, 1000);
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<{ answerId: number }>();

  result = signal<{ answerId: number | null }>({ answerId: null });
  _error = signal<boolean>(false);

  constructor(private sanitizer: DomSanitizer) {}

  getSafeVideoUrl(): SafeResourceUrl | null {
    if (!this.data?.videoUrl) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.videoUrl);
  }

  onSelect(id: number) {
    this.result.set({ answerId: id });
    this.update.emit({ answerId: id });
  }
}
